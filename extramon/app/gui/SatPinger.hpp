#pragma once

#include <string>
#include <vector>

#define SATELLITES_GET_URL "https://sia.watch/api/satellites"
#define SATELLITE_PROTOCOL "https://"
#define SATELLITE_PING_PATH "/extramon/client/ping"

class SatPinger {
    public:
        inline SatPinger(std::string user_agent, unsigned char * privkey)
        : user_agent(user_agent),
          privkey(privkey),
          satellite_cache_age(0){

        }

        class Satellite{
            public:
            const std::string name;
            const std::string address;
            Satellite(std::string name, std::string address):
            name(name), address(address){

            }
        };

        std::vector<Satellite> get_satellites();
        std::vector<Satellite> get_satellites_cache();
        bool is_satellites_cache_fresh();

        class PingerException {
            public:
            enum ExceptionType {
                CURL_EASY_PERFORM_FAILED,
                HTTP_ERROR_CODE,
                INVALID_JSON,
                INTERNAL_ERROR,
            };
            const std::string details;
            const ExceptionType type;
            inline PingerException(ExceptionType type, std::string details):
            details(details), type(type){};
        };

        double ping_satellite(const std::string satellite_url, time_t timestamp);
    private:
        std::string user_agent;
        unsigned char * privkey;
        std::vector<Satellite> satellite_cache;
        time_t satellite_cache_age;
};