#pragma once

#include <string>
#include <iostream>

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
#include <shlobj.h>
#include <windows.h>
#else
#error "Unsupported OS"
#endif

inline std::string getDefaultPrivkeyPath(){
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
    TCHAR szPath[MAX_PATH];
    std::string path;
    if (SUCCEEDED(SHGetFolderPath(NULL, CSIDL_COMMON_APPDATA, NULL, 0, szPath))){
        path = szPath;
        path += "/SiaWatch";
        if (CreateDirectory(path.c_str(), NULL) ||
        ERROR_ALREADY_EXISTS == GetLastError()){
            path += "/private.key";
            return path;
        }
    }
    return "./private.key";
#endif
}

inline void setWorkdir(){
#ifdef __linux__
    char szPath[4096];
    readlink("/proc/self/exe", szPath, 4095);
    std::string filename = szPath;
    const size_t last_slash_idx = filename.rfind('\\');
    if (std::string::npos != last_slash_idx){
        std::string directory = filename.substr(0, last_slash_idx);
        std::cout << "Changing workdir to " << directory << std::endl;
        chdir(directory.c_str());
        return;
    }
#else
    TCHAR szPath[MAX_PATH];
    DWORD result = GetModuleFileName(0, szPath, MAX_PATH - 1);
    if(result > 0){
        std::string filename = szPath;
        std::string directory;
        const size_t last_slash_idx = filename.rfind('\\');
        if (std::string::npos != last_slash_idx){
            directory = filename.substr(0, last_slash_idx);
            std::cout << "Changing workdir to " << directory << std::endl;
            chdir(directory.c_str());
            return;
        }
    }
#endif
    std::cout << "Couldn't change workdir" << std::endl;
}