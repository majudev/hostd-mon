#pragma once

extern "C"{
  #include <gtk/gtk.h>
  #include <pthread.h>
}

#include <vector>
#include <ctime>

#include "SatPinger.hpp"
#include "SatellitesPanel.hpp"

#ifdef __linux__
#include <unistd.h>
#elif defined(WIN32) || defined(_WIN32) || defined(__WIN32__) || defined(__NT__)
#include <synchapi.h>
#define sleep(n) Sleep(n*1000)
#define usleep(n) Sleep(n/1000)
#else
#error "Unsupported OS"
#endif

#include <iostream>

class Watchdog {
    public:
        inline Watchdog(std::vector<SatellitePanel> &satellites, SatPinger &satpinger, GtkLabel * &logbook_label, GtkSpinner * &logbook_spinner):
        satellites(satellites), satpinger(satpinger), logbook_label(logbook_label), logbook_spinner(logbook_spinner){
            
        }

        bool start_worker(){
            int res = pthread_create(&t, NULL, &Watchdog::thread_helper, this);
            return !res;
        }
    private:
        pthread_t t;
        bool alive = true;
        std::vector<SatellitePanel> &satellites;
        SatPinger &satpinger;
        GtkLabel * &logbook_label;
        GtkSpinner * &logbook_spinner;

        inline void worker(){
            while(this->alive){
                this->update_logbook("Pinging satellites...", true);

                time_t timestamp = time(NULL);

                double bestMs = DBL_MAX;
                double bestIndex = -1;
                for(int i = 0; i < satellites.size(); ++i){
                    auto satellite = satellites[i].get_satellite();
                    const std::string &name = satellite.name;
                    const std::string &address = satellite.address;
                    this->update_logbook("Pinging satellite " + name + "...", true);
                    satellites[i].set_status(SatellitePanel::Status::SYNCING);

                    try{
                        double ping = satpinger.ping_satellite(address, timestamp);

                        satellites[i].set_status(SatellitePanel::Status::OK);
                        satellites[i].set_ping_ms(ping);

                        double avg_ping = satellites[i].get_avg_ping();

                        if(avg_ping < bestMs){
                            bestMs = avg_ping;
                            bestIndex = i;
                        }
                    }catch(SatPinger::PingerException &error){
                        if(error.type == SatPinger::PingerException::CURL_EASY_PERFORM_FAILED){
                            this->update_logbook("Cannot connect to satellite " + name + ": " + error.details, false);
                        }else if(error.type == SatPinger::PingerException::HTTP_ERROR_CODE){
                            this->update_logbook("Cannot ping satellite " + name + ": got HTTP/" + error.details, false);
                        }else if(error.type == SatPinger::PingerException::INVALID_JSON){
                            this->update_logbook("Satellite " + name + " returned malformed JSON: " + error.details, false);
                        }else{
                            this->update_logbook("Cannot ping satellite " + name + ": " + error.details, false);
                        }
                        satellites[i].set_status(SatellitePanel::Status::ERROR);
                        sleep(5);
                        continue;
                    }
                }

                this->update_logbook("Finding best satellite", true);
                if(bestIndex >= 0){
                    for(int i = 0; i < satellites.size(); ++i){
                        satellites[i].set_main(bestIndex == i);
                    }
                }

                this->update_logbook("", false);

                sleep(60);
            }
        }

        inline static void * thread_helper(void *context){
            ((Watchdog *)context)->worker();
            return NULL;
        }

        struct update_logbook_helper_input {
            Watchdog* ctx;
            char* new_text;
            bool spinner;
        };

        inline static gboolean update_logbook_helper(gpointer user_data){
            struct update_logbook_helper_input* input = (struct update_logbook_helper_input*) user_data;
            Watchdog* object = input->ctx;
            char * new_text = input->new_text;
            gtk_label_set_text(object->logbook_label, new_text);
            if(input->spinner) gtk_spinner_start(object->logbook_spinner);
            else gtk_spinner_stop(object->logbook_spinner);
            free(new_text);
            free(user_data);
            return false;
        }

        inline void update_logbook(std::string text, bool spinner){
            struct update_logbook_helper_input * input = (struct update_logbook_helper_input*) malloc(sizeof(struct update_logbook_helper_input));
            input->ctx = this;
            input->new_text = strdup(text.c_str());
            input->spinner = spinner;
            g_idle_add(&Watchdog::update_logbook_helper, input);
        }
};