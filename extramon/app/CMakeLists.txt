project(hello-world C CXX)

cmake_minimum_required(VERSION 3.10)

# Use the package PkgConfig to detect GTK+ headers/library files
find_package(PkgConfig REQUIRED)
pkg_check_modules(GTK REQUIRED gtk+-3.0)
pkg_check_modules(SECP256K1 REQUIRED libsecp256k1)
pkg_check_modules(JANSSON REQUIRED jansson)
find_package(CURL REQUIRED)
set(THREADS_PREFER_PTHREAD_FLAG ON)
find_package(Threads REQUIRED)

add_executable(extramon 
    src/main.c
    src/urls.c
    src/ping_satellite.c
    src/sha256.c
)
add_executable(extramon-gui 
    gui/main.cpp
    gui/SatPinger.cpp
    src/sha256.c
)
install(TARGETS extramon extramon-gui DESTINATION bin)
install(DIRECTORY imgs/ DESTINATION imgs)

target_link_libraries(extramon PUBLIC CURL::libcurl)
target_link_libraries(extramon-gui PUBLIC CURL::libcurl)

target_link_libraries(extramon-gui PUBLIC Threads::Threads)

target_link_libraries(extramon-gui PUBLIC ${GTK_LIBRARIES})
target_include_directories(extramon-gui PUBLIC ${GTK_INCLUDE_DIRS})
target_link_directories(extramon-gui PUBLIC ${GTK_LIBRARY_DIRS})

target_link_libraries(extramon-gui PUBLIC ${SECP256K1_LIBRARIES})
target_include_directories(extramon-gui PUBLIC ${SECP256K1_INCLUDE_DIRS})
target_link_libraries(extramon PUBLIC ${SECP256K1_LIBRARIES})
target_include_directories(extramon PUBLIC ${SECP256K1_INCLUDE_DIRS})

target_link_libraries(extramon-gui PUBLIC ${JANSSON_LIBRARIES})
target_include_directories(extramon-gui PUBLIC ${JANSSON_INCLUDE_DIRS})
target_link_libraries(extramon PUBLIC ${JANSSON_LIBRARIES})
target_include_directories(extramon PUBLIC ${JANSSON_INCLUDE_DIRS})
