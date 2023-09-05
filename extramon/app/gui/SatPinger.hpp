#pragma once

#include <string>
#include <vector>

#define SATELLITES_GET_URL "https://sia.watch/api/satellites"

class SatPinger {
    public:
        inline SatPinger(std::string user_agent) : user_agent(user_agent){

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

        class PingerException {
            public:
            enum ExceptionType {
                CURL_EASY_PERFORM_FAILED,
                HTTP_ERROR_CODE,
                INVALID_JSON,
            };
            const std::string details;
            const ExceptionType type;
            inline PingerException(ExceptionType type, std::string details):
            details(details), type(type){};
        };
    private:
        std::string user_agent;
};