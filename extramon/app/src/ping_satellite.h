#ifndef _PINGSATELLITE_H
#define _PINGSATELLITE_H

#include <time.h>

struct ping_result {
    const char * satellite_url;
    int ping_status;
    double ping_time;
};

extern int ping_satellite(const char * satellite_url, time_t timestamp, const unsigned char * privkey, double * query_time);
extern int ping_all_satellites(struct ping_result ping_result[], const unsigned char * privkey);

#endif
