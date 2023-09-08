#include "SatPinger.hpp"

#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cfloat>
#include <ctime>

extern "C"{
  #include <curl/curl.h>
  #include <jansson.h>
  #include "../src/sha256.h"
}

#include <secp256k1.h>
#include "./fill_random.hpp"

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

double SatPinger::ping_satellite(const std::string satellite_url, time_t timestamp){
    //printf("Pinging satellite %s\n", satellite_url);

    secp256k1_context * ctx = secp256k1_context_create(SECP256K1_CONTEXT_SIGN);
    secp256k1_pubkey pubkey;
    if(!secp256k1_ec_pubkey_create(ctx, &pubkey, privkey)){
        secp256k1_context_destroy(ctx);
        throw PingerException(PingerException::ExceptionType::INTERNAL_ERROR, "Cannot derive pubkey from privkey, dying. This is probably error in the library.");
    }
    unsigned char compressed_pubkey[33];
    size_t len = sizeof(compressed_pubkey);
    if(!secp256k1_ec_pubkey_serialize(ctx, compressed_pubkey, &len, &pubkey, SECP256K1_EC_COMPRESSED) || len != sizeof(compressed_pubkey)){
        secp256k1_context_destroy(ctx);
        throw PingerException(PingerException::ExceptionType::INTERNAL_ERROR, "Cannot derive compressed pubkey from pubkey, dying. This is probably bug in the library.");
    }
    char compressed_pubkey_str[67];
    for(int i = 0; i < len; ++i){
        sprintf(&compressed_pubkey_str[2*i], "%02x", compressed_pubkey[i]);
    }

    json_error_t error;
    json_t * data_root = json_object();
    json_object_set_new(data_root, "timestamp", json_integer(timestamp));

    char * data_string = json_dumps(data_root, JSON_COMPACT | JSON_ENSURE_ASCII);

    BYTE hash[SHA256_BLOCK_SIZE];
    SHA256_CTX sha256;
    sha256_init(&sha256);
	  sha256_update(&sha256, (const BYTE*) data_string, strlen(data_string));
	  sha256_final(&sha256, hash);

    /*printf("Hash: ");
    for(int i = 0; i < SHA256_BLOCK_SIZE; ++i){
        printf("%02x", hash[i]);
    }
    printf("\n");*/

    secp256k1_ecdsa_signature sig;
    if(!secp256k1_ecdsa_sign(ctx, &sig, hash, privkey, NULL, NULL)){
        secp256k1_context_destroy(ctx);
        throw PingerException(PingerException::ExceptionType::INTERNAL_ERROR, "Cannot sign the message. This is probably error in the library.");
    }
    unsigned char serialized_signature[64];
    if(!secp256k1_ecdsa_signature_serialize_compact(ctx, serialized_signature, &sig)){
        secp256k1_context_destroy(ctx);
        throw PingerException(PingerException::ExceptionType::INTERNAL_ERROR, "Cannot compress message signature");
    }
    char serialized_signature_string[129];
    for(int i = 0; i < sizeof(serialized_signature); ++i){
        sprintf(&serialized_signature_string[2*i], "%02x", serialized_signature[i]);
    }

    secp256k1_context_destroy(ctx);

    //data_string[15] = 'f';

    json_t * root = json_object();
    json_object_set_new(root, "data", json_string(data_string));
    json_object_set_new(root, "signature", json_string(serialized_signature_string));
    json_object_set_new(root, "pubkey", json_string(compressed_pubkey_str));

    const char * post_string = json_dumps(root, JSON_COMPACT | JSON_ENSURE_ASCII);
    free((void*)data_string);

    //printf("PostData: %s\n", post_string);




    CURL *curl_handle;
    CURLcode res;

    struct MemoryStruct chunk;

    chunk.memory = (char*) malloc(1);
    chunk.size = 0;

    double total_time;
    double nslookup_time;

    curl_handle = curl_easy_init();

    char * urlbuffer = (char*) malloc(sizeof(char) * (strlen(SATELLITE_PROTOCOL) + satellite_url.size() + strlen(SATELLITE_PING_PATH) + 1));

    strcpy(urlbuffer, SATELLITE_PROTOCOL);
    strcat(urlbuffer, satellite_url.c_str());
    strcat(urlbuffer, SATELLITE_PING_PATH);

    struct curl_slist * hs = NULL;
    hs = curl_slist_append(hs, "Content-Type: application/json");
    curl_easy_setopt(curl_handle, CURLOPT_HTTPHEADER, hs);
    curl_easy_setopt(curl_handle, CURLOPT_URL, urlbuffer);
    curl_easy_setopt(curl_handle, CURLOPT_WRITEFUNCTION, SaveChunkCallback);
    curl_easy_setopt(curl_handle, CURLOPT_WRITEDATA, (void *)&chunk);
    curl_easy_setopt(curl_handle, CURLOPT_USERAGENT, this->user_agent.c_str());
    curl_easy_setopt(curl_handle, CURLOPT_POSTFIELDS, post_string);

    res = curl_easy_perform(curl_handle);
    free((void*)post_string);

    if(res != CURLE_OK) {
        std::string details = curl_easy_strerror(res);
        curl_easy_cleanup(curl_handle);
        free(chunk.memory);
        throw PingerException(PingerException::ExceptionType::CURL_EASY_PERFORM_FAILED, details);
    }

    double query_time;
    curl_easy_getinfo(curl_handle, CURLINFO_NAMELOOKUP_TIME, &nslookup_time);
    curl_easy_getinfo(curl_handle, CURLINFO_TOTAL_TIME, &total_time);
    query_time = total_time - nslookup_time;

    long http_code;
    curl_easy_getinfo(curl_handle, CURLINFO_RESPONSE_CODE, &http_code);
    printf("%d\n", http_code);
    if(http_code != 200){
        curl_easy_cleanup(curl_handle);
        free(chunk.memory);
        throw PingerException(PingerException::ExceptionType::HTTP_ERROR_CODE, std::to_string(http_code));
    }
    
    //printf("%lu bytes retrieved\n", (unsigned long)chunk.size);

    curl_easy_cleanup(curl_handle);
    free(chunk.memory);

    return query_time;
}