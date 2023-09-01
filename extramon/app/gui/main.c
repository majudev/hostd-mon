#include <gtk/gtk.h>
#include <curl/curl.h>

static void activate (GtkApplication* app, gpointer user_data){
  GtkWidget * window = gtk_application_window_new(app);
  gtk_window_set_title(GTK_WINDOW(window), "Extra Monitor App");
  gtk_window_set_default_size(GTK_WINDOW(window), 400, 400);
  gtk_widget_show_all(window);
}

int main (int argc, char **argv){
  curl_global_init(CURL_GLOBAL_ALL);

  GtkApplication * app = gtk_application_new("watch.hostd.extramon", G_APPLICATION_FLAGS_NONE);
  g_signal_connect(app, "activate", G_CALLBACK(activate), NULL);
  int status = g_application_run(G_APPLICATION(app), argc, argv);
  g_object_unref(app);

  curl_global_cleanup();

  return status;
}
