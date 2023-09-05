#pragma once

extern "C"{
  #include <gtk/gtk.h>
}

#include "InitializerWidget.hpp"
#include "SatPinger.hpp"

class MainWindow {
    public:
        inline MainWindow(GtkApplication *app, gpointer user_data, const char * privkey_path):
        satpinger("libcurl-agent/1.0"),
        init_widget(privkey_path, privkey, satpinger){
            this->window = GTK_APPLICATION_WINDOW(gtk_application_window_new(app));
            gtk_window_set_title(GTK_WINDOW(window), "Sia.Watch Monitor App");
            gtk_window_set_default_size(GTK_WINDOW(window), 400, 400);

            init_widget.show();

            gtk_container_add (GTK_CONTAINER(window), GTK_WIDGET(this->init_widget.get_container()));
            gtk_widget_show(GTK_WIDGET(this->window));
        }

    private:
        unsigned char privkey[32];
        SatPinger satpinger;

        GtkApplicationWindow * window;

        InitWidget init_widget;
};

