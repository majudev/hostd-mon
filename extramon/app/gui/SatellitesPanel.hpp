#pragma once

extern "C"{
  #include <gtk/gtk.h>
}

#include "SatPinger.hpp"
#include <vector>
#include <numeric>
#include <sstream>

class SatellitePanel {
    public:
        inline SatellitePanel(const unsigned char * privkey, SatPinger::Satellite satellite, SatPinger &satpinger):
        privkey(privkey),
        satpinger(satpinger),
        satellite(satellite){
            this->box = GTK_BOX(gtk_box_new(GTK_ORIENTATION_VERTICAL, 10));

            this->filler_top = GTK_LABEL(gtk_label_new(""));
            gtk_box_pack_start(this->box, GTK_WIDGET(this->filler_top), true, true, 20);

            this->name_label = GTK_LABEL(gtk_label_new(this->satellite.name.c_str()));
            gtk_box_pack_start(this->box, GTK_WIDGET(this->name_label), false, false, 0);

            this->flag = this->get_flag_image();
            if(this->flag) gtk_box_pack_start(this->box, GTK_WIDGET(this->flag), false, false, 0);

            this->status_ok = GTK_IMAGE(gtk_image_new_from_file("../imgs/web-check.svg"));
            this->status_syncing = GTK_IMAGE(gtk_image_new_from_file("../imgs/web-sync.svg"));
            this->status_error = GTK_IMAGE(gtk_image_new_from_file("../imgs/web-remove.svg"));
            this->status_unknown = GTK_IMAGE(gtk_image_new_from_file("../imgs/help.svg"));

            gtk_box_pack_start(this->box, GTK_WIDGET(this->status_ok), false, false, 0);
            gtk_box_pack_start(this->box, GTK_WIDGET(this->status_syncing), false, false, 0);
            gtk_box_pack_start(this->box, GTK_WIDGET(this->status_error), false, false, 0);
            gtk_box_pack_start(this->box, GTK_WIDGET(this->status_unknown), false, false, 0);



            this->status_label_box = GTK_BOX(gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 5));

            this->status_label_box_filler_start = GTK_LABEL(gtk_label_new(""));
            gtk_box_pack_start(this->status_label_box, GTK_WIDGET(this->status_label_box_filler_start), true, true, 0);

            this->status_label_img_yes = GTK_IMAGE(gtk_image_new_from_icon_name("gtk-yes", GTK_ICON_SIZE_BUTTON));
            this->status_label_img_no = GTK_IMAGE(gtk_image_new_from_icon_name("gtk-no", GTK_ICON_SIZE_BUTTON));
            gtk_box_pack_start(this->status_label_box, GTK_WIDGET(this->status_label_img_yes), false, false, 5);
            gtk_box_pack_start(this->status_label_box, GTK_WIDGET(this->status_label_img_no), false, false, 5);

            this->status_label = GTK_LABEL(gtk_label_new(""));
            gtk_box_pack_start(this->status_label_box, GTK_WIDGET(this->status_label), false, false, 0);

            this->status_label_box_filler_end = GTK_LABEL(gtk_label_new(""));
            gtk_box_pack_start(this->status_label_box, GTK_WIDGET(this->status_label_box_filler_end), true, true, 0);

            gtk_box_pack_start(this->box, GTK_WIDGET(this->status_label_box), false, false, 0);



            this->main_label_box = GTK_BOX(gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 5));

            this->main_label_box_filler_start = GTK_LABEL(gtk_label_new(""));
            gtk_box_pack_start(this->main_label_box, GTK_WIDGET(this->main_label_box_filler_start), true, true, 0);

            this->main_label_img_apply = GTK_IMAGE(gtk_image_new_from_icon_name("gtk-apply", GTK_ICON_SIZE_BUTTON));
            gtk_box_pack_start(this->main_label_box, GTK_WIDGET(this->main_label_img_apply), false, false, 5);

            this->main_label = GTK_LABEL(gtk_label_new(""));
            gtk_box_pack_start(this->main_label_box, GTK_WIDGET(this->main_label), false, false, 0);

            this->main_label_box_filler_end = GTK_LABEL(gtk_label_new(""));
            gtk_box_pack_start(this->main_label_box, GTK_WIDGET(this->main_label_box_filler_end), true, true, 0);

            gtk_box_pack_start(this->box, GTK_WIDGET(this->main_label_box), false, false, 0);



            this->last_ping_label = GTK_LABEL(gtk_label_new(""));
            this->last_n_pings_label = GTK_LABEL(gtk_label_new(""));
            gtk_box_pack_start(this->box, GTK_WIDGET(this->last_ping_label), false, false, 0);
            gtk_box_pack_start(this->box, GTK_WIDGET(this->last_n_pings_label), false, false, 0);



            this->filler_bottom = GTK_LABEL(gtk_label_new(""));
            gtk_box_pack_start(this->box, GTK_WIDGET(this->filler_bottom), true, true, 20);

            gtk_widget_show_all(GTK_WIDGET(this->box));

            this->set_status(Status::UNKNOWN);
            this->set_main(false);
        }

        enum Status {
            OK, SYNCING, ERROR, UNKNOWN
        };

        inline void set_status(Status status){
            if(status == OK){
                gtk_widget_show(GTK_WIDGET(this->status_ok));
                gtk_widget_hide(GTK_WIDGET(this->status_syncing));
                gtk_widget_hide(GTK_WIDGET(this->status_error));
                gtk_widget_hide(GTK_WIDGET(this->status_unknown));

                gtk_widget_hide(GTK_WIDGET(this->status_label_img_no));
                gtk_widget_show(GTK_WIDGET(this->status_label_img_yes));
                gtk_label_set_text(this->status_label, "Status: OK");
            }else if(status == SYNCING){
                gtk_widget_hide(GTK_WIDGET(this->status_ok));
                gtk_widget_show(GTK_WIDGET(this->status_syncing));
                gtk_widget_hide(GTK_WIDGET(this->status_error));
                gtk_widget_hide(GTK_WIDGET(this->status_unknown));

                gtk_widget_hide(GTK_WIDGET(this->status_label_img_no));
                gtk_widget_hide(GTK_WIDGET(this->status_label_img_yes));
                gtk_label_set_text(this->status_label, "Status: syncing...");
            }else if(status == ERROR){
                gtk_widget_hide(GTK_WIDGET(this->status_ok));
                gtk_widget_hide(GTK_WIDGET(this->status_syncing));
                gtk_widget_show(GTK_WIDGET(this->status_error));
                gtk_widget_hide(GTK_WIDGET(this->status_unknown));

                gtk_widget_show(GTK_WIDGET(this->status_label_img_no));
                gtk_widget_hide(GTK_WIDGET(this->status_label_img_yes));
                gtk_label_set_text(this->status_label, "Status: error");

                gtk_label_set_text(this->last_ping_label, "Last ping: failed");
            }else{
                gtk_widget_hide(GTK_WIDGET(this->status_ok));
                gtk_widget_hide(GTK_WIDGET(this->status_syncing));
                gtk_widget_hide(GTK_WIDGET(this->status_error));
                gtk_widget_show(GTK_WIDGET(this->status_unknown));

                gtk_widget_hide(GTK_WIDGET(this->status_label_img_no));
                gtk_widget_hide(GTK_WIDGET(this->status_label_img_yes));
                gtk_label_set_text(this->status_label, "Status: unknown");
            }
        }

        inline void set_main(bool status){
            if(status){
                gtk_widget_show(GTK_WIDGET(this->main_label_img_apply));
                gtk_label_set_text(this->main_label, "Main satellite");
            }else{
                gtk_widget_hide(GTK_WIDGET(this->main_label_img_apply));
                gtk_label_set_text(this->main_label, "Ping-only satellite");
            }
            this->main = status;
        }

        inline void set_ping_ms(double ms){
            std::string text = "Last ping: ";
            text += to_string_with_precision(ms, 3);
            text += "ms";
            gtk_label_set_text(this->last_ping_label, text.c_str());

            if(this->pings.size() > 20){
                this->pings.erase(this->pings.begin());
            }
            this->pings.push_back(ms);

            double avg_ms = this->pings.size() == 0 ? 0.0 : (std::accumulate(this->pings.begin(), this->pings.end(), 0.0) / this->pings.size());
            text = "Ping average: ";
            text += to_string_with_precision(avg_ms, 3);
            text += "ms";
            gtk_label_set_text(this->last_n_pings_label, text.c_str());
        }

        inline GtkBox * get_container(){
            return this->box;
        }

        inline double get_avg_ping(){
            return this->pings.size() == 0 ? 0.0 : (std::accumulate(this->pings.begin(), this->pings.end(), 0.0) / this->pings.size());
        }

        inline bool is_main(){
            return this->main;
        }

        inline SatPinger::Satellite& get_satellite(){
            return this->satellite;
        }

    private:
        const unsigned char * privkey;
        SatPinger satpinger;
        SatPinger::Satellite satellite;

        std::vector<double> pings;
        bool main = false;;

        GtkBox * box;
        GtkLabel * name_label;

        GtkImage * flag;
        
        GtkImage * status_ok;
        GtkImage * status_syncing;
        GtkImage * status_error;
        GtkImage * status_unknown;

        GtkBox * status_label_box;
        GtkImage * status_label_img_yes;
        GtkImage * status_label_img_no;
        GtkLabel * status_label;
        GtkLabel * status_label_box_filler_start;
        GtkLabel * status_label_box_filler_end;

        GtkBox * main_label_box;
        GtkImage * main_label_img_apply;
        GtkLabel * main_label;
        GtkLabel * main_label_box_filler_start;
        GtkLabel * main_label_box_filler_end;

        GtkLabel * last_ping_label;
        GtkLabel * last_n_pings_label;

        GtkLabel * filler_top;
        GtkLabel * filler_bottom;

        template <typename T>
        inline static std::string to_string_with_precision(const T a_value, const int n = 6){
            std::ostringstream out;
            out.precision(n);
            out << std::fixed << a_value;
            return std::move(out).str();
        }

        inline GtkImage * get_flag_image(){
            if(this->satellite.address == "satellite-de.sia.watch"){
                GtkWidget * image = gtk_image_new_from_file("../imgs/flags/de.svg");
                gtk_widget_show(image);
                return GTK_IMAGE(image);
            }else if(this->satellite.address == "satellite-ca.sia.watch"){
                GtkWidget * image = gtk_image_new_from_file("../imgs/flags/ca.svg");
                gtk_widget_show(image);
                return GTK_IMAGE(image);
            }else if(this->satellite.address == "satellite-fr.sia.watch"){
                GtkWidget * image = gtk_image_new_from_file("../imgs/flags/fr.svg");
                gtk_widget_show(image);
                return GTK_IMAGE(image);
            }
            return NULL;
        }
};

