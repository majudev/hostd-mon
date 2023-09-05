extern "C"{
  #include <gtk/gtk.h>
  #include <curl/curl.h>
  #include "../src/ping_satellite.h"
}

#include "utils.hpp"
#include "MainWindow.hpp"

MainWindow * window = NULL;
const char * privkey_path;

static void activate (GtkApplication* app, gpointer user_data){
  window = new MainWindow(app, user_data, privkey_path);
}

int main (int argc, char **argv){
  const std::string pk_path = getDefaultPrivkeyPath();
  privkey_path = pk_path.c_str();

  for(int i = 1; i+1 < argc; i += 2){
      if(!strcmp(argv[i], "--privkey")){
          privkey_path = argv[i+1];
      }
  }

  curl_global_init(CURL_GLOBAL_ALL);

  GtkApplication * app = gtk_application_new("watch.sia.extramon", G_APPLICATION_FLAGS_NONE);
  g_signal_connect(app, "activate", G_CALLBACK(activate), NULL);
  int status = g_application_run(G_APPLICATION(app), argc, argv);
  delete window;
  g_object_unref(app);

  curl_global_cleanup();

  return status;
}
