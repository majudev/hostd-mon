#pragma once

extern "C"{
  #include <gtk/gtk.h>
  #include <pthread.h>
}

#include <iostream>
#include <secp256k1.h>
#include "./fill_random.hpp"
#include "SatPinger.hpp"

#ifdef __linux__
#include <unistd.h>
#elif defined(WIN32) || defined(_WIN32) || defined(__WIN32__) || defined(__NT__)
#include <synchapi.h>
#define sleep(n) Sleep(n*1000)
#define usleep(n) Sleep(n/1000)
#else
#error "Unsupported OS"
#endif

class InitWidget {
    public:
        inline InitWidget(const char * privkey_path, unsigned char * privkey, SatPinger& satpinger):
        privkey_path(privkey_path), privkey(privkey), satpinger(satpinger){
            this->box = GTK_BOX(gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 0));
            this->vbox = GTK_BOX(gtk_box_new(GTK_ORIENTATION_VERTICAL, 0));
            gtk_box_pack_start(this->box, GTK_WIDGET(this->vbox), true, true, 0);

            this->tl_box = GTK_BOX(gtk_box_new(GTK_ORIENTATION_VERTICAL, 0));
            gtk_box_set_center_widget(this->vbox, GTK_WIDGET(this->tl_box));

            // Spinner at center
            this->fullsceen_spinner = GTK_SPINNER(gtk_spinner_new());
            gtk_spinner_start(this->fullsceen_spinner);
            //gtk_box_set_center_widget(this->tl_box, GTK_WIDGET(this->fullsceen_spinner));
            gtk_box_pack_start(this->tl_box, GTK_WIDGET(this->fullsceen_spinner), false, true, 0);

            // Progress message below
            this->progress_label = GTK_LABEL(gtk_label_new("Loading application..."));
            gtk_label_set_justify(this->progress_label, GTK_JUSTIFY_CENTER);
            gtk_label_set_line_wrap(this->progress_label, true);
            gtk_box_pack_start(this->tl_box, GTK_WIDGET(this->progress_label), false, true, 0);

            pthread_t t;
            int res = pthread_create(&t, NULL, &InitWidget::privkey_thread_helper, this);
            if(res){
                gtk_spinner_stop(this->fullsceen_spinner);
                gtk_label_set_text(this->progress_label, "Couldn't create worker thread");
                return;
            }
        }

        inline void show(){
            gtk_widget_show_all(GTK_WIDGET(this->box));
        }

        inline void hide(){
            gtk_widget_hide(GTK_WIDGET(this->box));
        }

        inline GtkBox * get_container(){
            return this->box;
        }

    private:
        SatPinger& satpinger;

        GtkBox * box;
        GtkBox * vbox;
        GtkBox * tl_box;
        GtkLabel * progress_label;
        GtkSpinner * fullsceen_spinner;
        const char * privkey_path;
        unsigned char * privkey;

        inline void load_privkey(){
            std::cout << "Loading private key..." << std::endl;

            std::cout << "Creating and randomizing secp256k1 context\n" << std::endl;
            update_progress_text("Creating and randomizing secp256k1 context");
            secp256k1_context * ctx = secp256k1_context_create(SECP256K1_CONTEXT_SIGN);
            unsigned char randomize[32];
            try{
                fill_random(privkey, 32);
            }catch(std::string &error){
                die_with_error(std::string("Failed to generate randomness: ") + error + ", dying\n");
                secp256k1_context_destroy(ctx);
                return;
            }
            if(!secp256k1_context_randomize(ctx, randomize)){
                die_with_error("Cannot randomize context");
                secp256k1_context_destroy(ctx);
                return;
            }

            std::cout << "Loading private key from " << privkey_path << std::endl;
            update_progress_text((std::string("Loading private key from ") + std::string(privkey_path)).c_str());
            FILE * file = fopen(privkey_path, "r");
            if(file == NULL){
                std::cout << "Cannot open file, generating random key..." << std::endl;
                update_progress_text("Cannot open file, generating random key...");
                while (1) {
                    try{
                        fill_random(privkey, 32);
                    }catch(std::string &error){
                        die_with_error(std::string("Failed to generate randomness: ") + error + ", dying\n");
                        secp256k1_context_destroy(ctx);
                        return;
                    }
                    if (secp256k1_ec_seckey_verify(ctx, privkey)) {
                        break;
                    }
                }

                std::cout << "Writing newly generated key to disk (path " << privkey_path << ")\n";
                file = fopen(privkey_path, "w");
                if(file == NULL){
                    die_with_error((std::string("Cannot write generated privkey to %s, dying\n") + privkey_path).c_str());
                    secp256k1_context_destroy(ctx);
                    return;
                }
                
                for (size_t i = 0; i < 32; ++i) {
                    fprintf(file, "%02x", privkey[i]);
                }
            }else{
                unsigned char hex_privkey[64];

                fseek(file, 0, SEEK_END);
                long file_size = ftell(file);
                fseek(file, 0, SEEK_SET);

                if(file_size == sizeof(hex_privkey) + 1) file_size -= 1;
                if(file_size != sizeof(hex_privkey)){
                    die_with_error("Privkey file contains wrong amount of data, dying.\nPlease remove the file to auto-regenerate the privkey.\n");
                    secp256k1_context_destroy(ctx);
                    return;
                }
            
                size_t bytes_read = fread(hex_privkey, 1, file_size, file);
                if (bytes_read != file_size) {
                    die_with_error((std::string("Error reading file") + strerror(errno)).c_str());
                    fclose(file);
                    secp256k1_context_destroy(ctx);
                    return;
                }

                for (size_t i = 0; i < sizeof(hex_privkey); i += 2) {
                    sscanf((const char *)&hex_privkey[i], "%2hhx", &privkey[i / 2]);
                }

                if(!secp256k1_ec_seckey_verify(ctx, privkey)){
                    die_with_error("Provided privkey fails verification. It probably means that it's invalid.\n");
                    secp256k1_context_destroy(ctx);
                    return;
                }
            }

            fclose(file);

            secp256k1_pubkey pubkey;
            if(!secp256k1_ec_pubkey_create(ctx, &pubkey, privkey)){
                die_with_error("Cannot derive pubkey from privkey, dying. This is probably error in the library.\n");
                secp256k1_context_destroy(ctx);
                return;
            }
            unsigned char compressed_pubkey[33];
            size_t len = sizeof(compressed_pubkey);
            if(!secp256k1_ec_pubkey_serialize(ctx, compressed_pubkey, &len, &pubkey, SECP256K1_EC_COMPRESSED) || len != sizeof(compressed_pubkey)){
                die_with_error("Cannot derive compressed pubkey from pubkey, dying. This is probably bug in the library.\n");
                secp256k1_context_destroy(ctx);
                return;
            }
            secp256k1_context_destroy(ctx);

            char compressed_pubkey_str[67];
            for(int i = 0; i < len; ++i){
                sprintf(&compressed_pubkey_str[2*i], "%02x", compressed_pubkey[i]);
            }
            update_progress_text((std::string("Successfuly loaded private key and derived pubkey ") + std::string(compressed_pubkey_str)).c_str());

            sleep(1);

            update_progress_text("Retrieving available satellites...");

            try {
                auto satellites = satpinger.get_satellites();
                if(satellites.size() == 0){
                    die_with_error("No satellites found. This is bug of the Sia.Watch monitoring system. Please report it.");
                    return;
                }
                update_progress_text(std::string("Found ") + std::to_string(satellites.size()) + " satellites");
            } catch(SatPinger::PingerException &error){
                if(error.type == SatPinger::PingerException::ExceptionType::HTTP_ERROR_CODE){
                    die_with_error((std::string("Cannot retrieve available satellites. Server responded with: HTTP/") + error.details).c_str());
                }else if(error.type == SatPinger::PingerException::ExceptionType::CURL_EASY_PERFORM_FAILED){
                    die_with_error((std::string("Cannot retrieve available satellites. Could not contact server: ") + error.details + ". Check your internet connection.").c_str());
                }else if(error.type == SatPinger::PingerException::ExceptionType::INVALID_JSON){
                    die_with_error((std::string("Cannot retrieve available satellites. Server returned malformed JSON: ") + error.details).c_str());
                }else{
                    die_with_error((std::string("Cannot retrieve available satellites: ") + error.details).c_str());
                }
                return;
            }

            this->emit_finished();
        }

        inline static void * privkey_thread_helper(void *context){
            ((InitWidget *)context)->load_privkey();
            return NULL;
        }

        struct update_text_helper_input {
            InitWidget* ctx;
            char* new_text;
        };

        inline static gboolean update_text_helper(gpointer user_data){
            struct update_text_helper_input* input = (struct update_text_helper_input*) user_data;
            InitWidget* object = input->ctx;
            char * new_text = input->new_text;
            gtk_label_set_text(object->progress_label, new_text);
            free(new_text);
            free(user_data);
            return false;
        }

        inline void update_progress_text(std::string text){
            struct update_text_helper_input * input = (struct update_text_helper_input*) malloc(sizeof(struct update_text_helper_input));
            input->ctx = this;
            input->new_text = strdup(text.c_str());
            g_idle_add(&InitWidget::update_text_helper, input);
        }

        inline static gboolean die_with_error_helper(gpointer user_data){
            struct update_text_helper_input* input = (struct update_text_helper_input*) user_data;
            InitWidget* object = input->ctx;
            char * new_text = input->new_text;
            gtk_label_set_text(object->progress_label, new_text);
            gtk_spinner_stop(object->fullsceen_spinner);
            free(new_text);
            free(user_data);
            return false;
        }

        inline void die_with_error(std::string text){
            text += "\nYou can now close the app, this failure is critical.";
            std::cout << text << std::endl;
            struct update_text_helper_input * input = (struct update_text_helper_input*) malloc(sizeof(struct update_text_helper_input));
            input->ctx = this;
            input->new_text = strdup(text.c_str());
            g_idle_add(&InitWidget::die_with_error_helper, input);
        }

        inline static gboolean emitter_helper(gpointer user_data){
            InitWidget * object = (InitWidget*) user_data;
            g_signal_emit_by_name(object->box, "init-complete");
            return false;
        }

        inline void emit_finished(){
            g_idle_add(&InitWidget::emitter_helper, this);
        }
};

