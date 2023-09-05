#pragma once

extern "C"{
  #include <gtk/gtk.h>
}

#include "SatPinger.hpp"

class SatellitePanel {
    public:
        inline SatellitePanel(const unsigned char * privkey, SatPinger::Satellite satellite, SatPinger &satpinger):
        privkey(privkey),
        satpinger(satpinger),
        satellite(satellite){
            this->box = GTK_BOX(gtk_box_new(GTK_ORIENTATION_VERTICAL, 0));

            this->name_label = GTK_LABEL(gtk_label_new(this->satellite.name.c_str()));
            gtk_box_pack_start(this->box, GTK_WIDGET(this->name_label), false, false, 0);

            gtk_widget_show_all(GTK_WIDGET(this->box));
        }

        inline void set_status(bool status){

        }

        inline void set_main(bool status){

        }

        inline void set_ping_ms(double ms){
            
        }

        inline GtkBox * get_container(){
            return this->box;
        }

    private:
        const unsigned char * privkey;
        SatPinger satpinger;
        SatPinger::Satellite satellite;

        GtkBox * box;
        GtkLabel * name_label;
};

