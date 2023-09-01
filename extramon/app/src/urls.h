#ifndef _URLS_H
#define _URLS_H

#include <stdlib.h>

#define SATELLITE_PROTOCOL "http://"
#define SATELLITE_PING_PATH "/client/ping"
#define SATELLITE_USERAGENT "libcurl-agent/1.0"

#define REGISTER_MON_PAGE "https://hostd.watch/add-new"

extern const char * satellite_urls[];
extern const size_t satellite_urls_size;

#endif