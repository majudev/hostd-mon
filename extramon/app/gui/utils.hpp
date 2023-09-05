#pragma once

#include <string>

#ifdef __linux__
#include <cstdlib>
#include <cstring>

extern "C" {
    #include <unistd.h>
    #include <sys/types.h>
    #include <sys/stat.h>
    #include <pwd.h>
    #include <dirent.h>
    #include <errno.h>
}
#elif defined(WIN32) || defined(_WIN32) || defined(__WIN32__) || defined(__NT__)
#error "Windows not supported YET"
#else
#error "Unsupported OS"
#endif

std::string getDefaultPrivkeyPath(){
#ifdef __linux__
    struct passwd *pw = getpwuid(getuid());
    const char * homedir = pw->pw_dir;

    const char * suffix = "/.siawatch";

    char * buffer = (char*) malloc(sizeof(char) * (strlen(homedir) + strlen(suffix) + 1));
    strcpy(buffer, homedir);
    strcat(buffer, suffix);

    DIR* dir = opendir(buffer);
    if (dir) {
        closedir(dir);
    } else if (ENOENT == errno) {
        mkdir(buffer, 0700);
    } else {
        free(buffer);
        return "";
    }

    std::string tr = std::string(buffer);
    tr += "/private.key";
    free(buffer);

    return tr;
#else
#error "Windows not supported YET"
#endif
}