extern "C"{
    #if defined(_WIN32)
    /*
    * The defined WIN32_NO_STATUS macro disables return code definitions in
    * windows.h, which avoids "macro redefinition" MSVC warnings in ntstatus.h.
    */
    #define WIN32_NO_STATUS
    #include <windows.h>
    #undef WIN32_NO_STATUS
    #include <ntstatus.h>
    #include <bcrypt.h>
    #elif defined(__linux__) || defined(__APPLE__) || defined(__FreeBSD__)
    #include <sys/random.h>
    #include <string.h>
    #else
    #error "Couldn't identify the OS"
    #endif

    #include <stddef.h>
    #include <limits.h>
    #include <stdio.h>
}
#include <string>

/* Returns 1 on success, and 0 on failure. */
inline static void fill_random(unsigned char* data, size_t size) {
#if defined(_WIN32)
    NTSTATUS res = BCryptGenRandom(NULL, data, size, BCRYPT_USE_SYSTEM_PREFERRED_RNG);
    if (res != STATUS_SUCCESS || size > ULONG_MAX) {
        throw std::string("error");
    }
#elif defined(__linux__)
    /* If `getrandom(2)` is not available you should fallback to /dev/urandom */
    ssize_t res = getrandom(data, size, 0);
    if (res < 0 || (size_t)res != size ) {
        throw std::string(strerror(errno));
    }
#else
#error "OS not supported!"
#endif
}