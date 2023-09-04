#ifndef _PINGSATELLITE_H
#define _PINGSATELLITE_H

#include <time.h>

extern int ping_satellite(const char * satellite_url, time_t timestamp, const unsigned char * privkey, double * query_time);

#endif
