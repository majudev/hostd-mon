project(hello-world C)

cmake_minimum_required(VERSION 3.10)

# Use the package PkgConfig to detect GTK+ headers/library files
find_package(PkgConfig REQUIRED)
pkg_check_modules(GTK REQUIRED gtk+-3.0)


add_executable(extramon-gui main.c)


target_link_libraries(extramon-gui PRIVATE ${GTK_LIBRARIES})
target_include_directories(extramon-gui PRIVATE ${GTK_INCLUDE_DIRS})
target_link_directories(extramon-gui PRIVATE ${GTK_LIBRARY_DIRS})
