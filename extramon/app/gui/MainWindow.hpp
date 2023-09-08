#pragma once

extern "C"{
  #include <gtk/gtk.h>
}

#include "InitializerWidget.hpp"
#include "SatellitesPanel.hpp"
#include "SatPinger.hpp"
#include "Watchdog.hpp"

class MainWindow {
    public:
        inline MainWindow(GtkApplication *app, gpointer user_data, const char * privkey_path):
        satpinger("libcurl-agent/1.0", privkey),
        init_widget(privkey_path, privkey, satpinger),
        watchdog(satellite_panels, satpinger, logbook_label, logbook_spinner){
            this->window = GTK_APPLICATION_WINDOW(gtk_application_window_new(app));
            gtk_window_set_title(GTK_WINDOW(window), "Sia.Watch Monitor App");
            gtk_window_set_default_size(GTK_WINDOW(window), 400, 400);

            /*this->tray_icon = gtk_status_icon_new_from_file("../imgs/web-remove.svg");
            gtk_status_icon_set_title(this->tray_icon, "Sia.Watch Monitor App");
            gtk_status_icon_set_visible(this->tray_icon, true);*/

            init_widget.show();

            this->main_box = GTK_BOX(gtk_box_new(GTK_ORIENTATION_VERTICAL, 0));
            gtk_box_pack_start(this->main_box, GTK_WIDGET(this->init_widget.get_container()), true, true, 0);

            gtk_container_add (GTK_CONTAINER(window), GTK_WIDGET(this->main_box));
            
            gtk_widget_show_all(GTK_WIDGET(this->window));

            g_signal_new("init-complete",
             G_TYPE_OBJECT, G_SIGNAL_RUN_FIRST,
             0, NULL, NULL,
             g_cclosure_marshal_VOID__VOID,
             G_TYPE_NONE, 0);
            /*g_signal_new("init-complete",
             G_TYPE_OBJECT, G_SIGNAL_RUN_FIRST,
             0, NULL, NULL,
             g_cclosure_marshal_VOID__POINTER,
             G_TYPE_NONE, 1, G_TYPE_POINTER);*/

            g_signal_connect(this->init_widget.get_container(), "init-complete", G_CALLBACK(&MainWindow::init_complete_handler), this);


            
            
            this->logbook_box = GTK_BOX(gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 0));
            this->logbook_spinner = GTK_SPINNER(gtk_spinner_new());
            gtk_spinner_start(this->logbook_spinner);
            this->logbook_label = GTK_LABEL(gtk_label_new("Initializing GUI"));
            gtk_label_set_justify(this->logbook_label, GTK_JUSTIFY_LEFT);
            this->logbook_filler = GTK_LABEL(gtk_label_new(""));
            gtk_box_pack_start(this->logbook_box, GTK_WIDGET(this->logbook_spinner), false, false, 0);
            gtk_box_pack_start(this->logbook_box, GTK_WIDGET(this->logbook_label), false, false, 10);
            gtk_box_pack_start(this->logbook_box, GTK_WIDGET(this->logbook_filler), true, true, 0);

            gtk_box_pack_end(this->main_box, GTK_WIDGET(this->logbook_box), false, true, 0);
            gtk_widget_hide(GTK_WIDGET(this->logbook_box));

            this->pubkey_label = GTK_LABEL(gtk_label_new(""));
            gtk_label_set_justify(this->pubkey_label, GTK_JUSTIFY_CENTER);
            gtk_label_set_selectable(this->pubkey_label, true);
            gtk_box_pack_end(this->main_box, GTK_WIDGET(this->pubkey_label), false, false, 10);
            gtk_widget_hide(GTK_WIDGET(this->pubkey_label));
        }

    private:
        unsigned char privkey[32];
        SatPinger satpinger;

        GtkApplicationWindow * window;
        //GtkStatusIcon * tray_icon;

        GtkBox * main_box;
        GtkBox * logbook_box;
        GtkSpinner * logbook_spinner;
        GtkLabel * logbook_label;
        GtkLabel * logbook_filler;

        GtkLabel * pubkey_label;

        GtkBox * satellites_box;
        std::vector<SatellitePanel> satellite_panels;

        InitWidget init_widget;

        Watchdog watchdog;

        inline static void init_complete_handler(GtkWidget *widget, gpointer user_data) {
            MainWindow* object = (MainWindow*) user_data;

            //gtk_widget_hide(GTK_WIDGET(object->init_widget.get_container()));
            //gtk_widget_hide(widget);
            object->init_widget.hide();
            gtk_widget_show_all(GTK_WIDGET(object->logbook_box));

            object->satellites_box = GTK_BOX(gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 0));
            auto satellites = object->satpinger.get_satellites_cache();
            for(auto iter = satellites.begin(); iter != satellites.end(); ++iter){
                object->satellite_panels.push_back(SatellitePanel(object->privkey, *iter, object->satpinger));
                gtk_box_pack_start(object->satellites_box, GTK_WIDGET(object->satellite_panels.back().get_container()), true, true, 0);
            }

            gtk_box_pack_start(object->main_box, GTK_WIDGET(object->satellites_box), true, true, 0);
            gtk_widget_show(GTK_WIDGET(object->satellites_box));

            gtk_label_set_text(object->pubkey_label, (std::string("Pubkey:\n") + object->init_widget.get_pubkey()).c_str());
            gtk_widget_show(GTK_WIDGET(object->pubkey_label));

            gtk_window_resize(GTK_WINDOW(object->window), 1, 1);

            //gtk_label_set_text(object->logbook_label, "Pinging satellites...");
            object->watchdog.start_worker();
        }
};

