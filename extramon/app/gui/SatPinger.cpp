#include "SatPinger.hpp"

#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cfloat>
#include <ctime>

extern "C"{
  #include <curl/curl.h>
  #include <jansson.h>
}

struct MemoryStruct {
  char *memory;
  size_t size;
};

static size_t SaveChunkCallback(void *chunk, size_t size, size_t nmemb, void *userp){
  size_t realsize = size * nmemb;
  struct MemoryStruct *mem = (struct MemoryStruct *)userp;
 
  char *ptr = (char*) realloc(mem->memory, mem->size + realsize + 1);
  if(!ptr) {
    printf("not enough memory (realloc returned NULL)\n");
    return 0;
  }
 
  mem->memory = ptr;
  memcpy(&(mem->memory[mem->size]), chunk, realsize);
  mem->size += realsize;
  mem->memory[mem->size] = 0;
 
  return realsize;
}

std::vector<SatPinger::Satellite> SatPinger::get_satellites(){
    CURL *curl_handle;
    CURLcode res;

    struct MemoryStruct chunk;

    chunk.memory = (char*)malloc(1);
    chunk.size = 0;

    curl_handle = curl_easy_init();

    curl_easy_setopt(curl_handle, CURLOPT_URL, SATELLITES_GET_URL);
    curl_easy_setopt(curl_handle, CURLOPT_WRITEFUNCTION, SaveChunkCallback);
    curl_easy_setopt(curl_handle, CURLOPT_WRITEDATA, (void *)&chunk);
    curl_easy_setopt(curl_handle, CURLOPT_USERAGENT, this->user_agent.c_str());

    res = curl_easy_perform(curl_handle);

    if(res != CURLE_OK) {
        std::string details = curl_easy_strerror(res);
        curl_easy_cleanup(curl_handle);
        throw PingerException(PingerException::ExceptionType::CURL_EASY_PERFORM_FAILED, details);
    }

    long http_code;
    curl_easy_getinfo(curl_handle, CURLINFO_RESPONSE_CODE, &http_code);
    if(http_code != 200){
        curl_easy_cleanup(curl_handle);
        free(chunk.memory);
        throw PingerException(PingerException::ExceptionType::HTTP_ERROR_CODE, std::to_string(http_code));
    }

    json_error_t error;
    json_t * root = json_loads(chunk.memory, JSON_REJECT_DUPLICATES, &error);

    if(!json_is_array(root)){
      throw PingerException(PingerException::ExceptionType::INVALID_JSON, "received JSON is not an array");
    }
    
    //printf("%lu bytes retrieved\n", (unsigned long)chunk.size);
    std::vector<Satellite> satellites;
    size_t index;
    json_t *value;
    json_array_foreach(root, index, value) {
      json_t * entry_name = json_object_get(value, "name");
      json_t * entry_address = json_object_get(value, "address");
      if(!json_is_object(value) || !entry_name || !entry_address || !json_is_string(entry_name) || !json_is_string(entry_address)){
        throw PingerException(PingerException::ExceptionType::INVALID_JSON, "received JSON array contains invalid object");
      }
      const char * name = json_string_value(entry_name);
      const char * address = json_string_value(entry_address);
      satellites.push_back(Satellite(name, address));
    }

    curl_easy_cleanup(curl_handle);
    free(chunk.memory);

    this->satellite_cache_age = time(NULL);
    this->satellite_cache = std::vector<Satellite>(satellites);

    return satellites;
}

std::vector<SatPinger::Satellite> SatPinger::get_satellites_cache(){
  return this->satellite_cache;
}

bool SatPinger::is_satellites_cache_fresh(){
  return this->satellite_cache_age + 600 > time(NULL);
}