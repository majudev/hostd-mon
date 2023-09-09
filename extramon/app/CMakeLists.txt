project(hello-world C CXX)

cmake_minimum_required(VERSION 3.10)

# Use the package PkgConfig to detect GTK+ headers/library files
find_package(PkgConfig REQUIRED)
pkg_check_modules(GTK REQUIRED gtk+-3.0)
pkg_check_modules(SECP256K1 QUIET libsecp256k1)
if(NOT SECP256K1_FOUND)
        include(FetchContent)
	FetchContent_Declare(
	  secp256k1
	  GIT_REPOSITORY https://github.com/bitcoin-core/secp256k1.git
	  GIT_TAG        199d27cea32203b224b208627533c2e813cd3b21 #0.4.0
	  OVERRIDE_FIND_PACKAGE
	)
	FetchContent_MakeAvailable(secp256k1)
	find_package(secp256k1 REQUIRED)
endif(NOT SECP256K1_FOUND)
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
install(TARGETS extramon-gui secp256k1 DESTINATION bin)
install(DIRECTORY share/siawatch/imgs/ DESTINATION share/siawatch/imgs)

target_link_libraries(extramon PUBLIC CURL::libcurl)
target_link_libraries(extramon-gui PUBLIC CURL::libcurl)

target_link_libraries(extramon-gui PUBLIC Threads::Threads)

target_link_libraries(extramon-gui PUBLIC ${GTK_LIBRARIES})
target_include_directories(extramon-gui PUBLIC ${GTK_INCLUDE_DIRS})
target_link_directories(extramon-gui PUBLIC ${GTK_LIBRARY_DIRS})

target_link_libraries(extramon PUBLIC secp256k1)
target_include_directories(extramon PUBLIC secp256k1)
target_link_libraries(extramon-gui PUBLIC secp256k1)
target_include_directories(extramon-gui PUBLIC secp256k1)

target_link_libraries(extramon-gui PUBLIC ${JANSSON_LIBRARIES})
target_include_directories(extramon-gui PUBLIC ${JANSSON_INCLUDE_DIRS})
target_link_libraries(extramon PUBLIC ${JANSSON_LIBRARIES})
target_include_directories(extramon PUBLIC ${JANSSON_INCLUDE_DIRS})

IF (WIN32)
  target_link_libraries(extramon PUBLIC bcrypt)
  target_link_libraries(extramon-gui PUBLIC bcrypt)
ENDIF(WIN32)