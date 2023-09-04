#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <secp256k1.h>
#include <curl/curl.h>
#include <jansson.h>

#include "urls.h"
#include "ping_satellite.h"
#include "sha256.h"

struct MemoryStruct {
  char *memory;
  size_t size;
};

static size_t SaveChunkCallback(void *chunk, size_t size, size_t nmemb, void *userp){
  size_t realsize = size * nmemb;
  struct MemoryStruct *mem = (struct MemoryStruct *)userp;
 
  char *ptr = realloc(mem->memory, mem->size + realsize + 1);
  if(!ptr) {
    /* out of memory! */
    printf("not enough memory (realloc returned NULL)\n");
    return 0;
  }
 
  mem->memory = ptr;
  memcpy(&(mem->memory[mem->size]), chunk, realsize);
  mem->size += realsize;
  mem->memory[mem->size] = 0;
 
  return realsize;
}

int ping_satellite(const char * satellite_url, time_t timestamp, const unsigned char * privkey, double * query_time){
    printf("Pinging satellite %s\n", satellite_url);

    secp256k1_context * ctx = secp256k1_context_create(SECP256K1_CONTEXT_SIGN);
    secp256k1_pubkey pubkey;
    if(!secp256k1_ec_pubkey_create(ctx, &pubkey, privkey)){
        printf("Cannot derive pubkey from privkey, dying. This is probably error in the library.\n");
        secp256k1_context_destroy(ctx);
        return 1;
    }
    unsigned char compressed_pubkey[33];
    size_t len = sizeof(compressed_pubkey);
    if(!secp256k1_ec_pubkey_serialize(ctx, compressed_pubkey, &len, &pubkey, SECP256K1_EC_COMPRESSED) || len != sizeof(compressed_pubkey)){
        printf("Cannot derive compressed pubkey from pubkey, dying. This is probably bug in the library.\n");
        secp256k1_context_destroy(ctx);
        return 1;
    }
    unsigned char compressed_pubkey_str[67];
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
	sha256_update(&sha256, data_string, strlen(data_string));
	sha256_final(&sha256, hash);

    /*printf("Hash: ");
    for(int i = 0; i < SHA256_BLOCK_SIZE; ++i){
        printf("%02x", hash[i]);
    }
    printf("\n");*/

    secp256k1_ecdsa_signature sig;
    if(!secp256k1_ecdsa_sign(ctx, &sig, hash, privkey, NULL, NULL)){
        printf("Cannot sign message\n");
        secp256k1_context_destroy(ctx);
        return 1;
    }
    unsigned char serialized_signature[64];
    if(!secp256k1_ecdsa_signature_serialize_compact(ctx, serialized_signature, &sig)){
        printf("Cannot compress message signature\n");
        secp256k1_context_destroy(ctx);
        return 1;
    }
    unsigned char serialized_signature_string[129];
    for(int i = 0; i < sizeof(serialized_signature); ++i){
        sprintf(&serialized_signature_string[2*i], "%02x", serialized_signature[i]);
    }

    secp256k1_context_destroy(ctx);

    //data_string[5] = 'f';

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

    chunk.memory = malloc(1);
    chunk.size = 0;

    double total_time;
    double nslookup_time;

    curl_handle = curl_easy_init();

    char * urlbuffer = malloc(sizeof(char) * (strlen(SATELLITE_PROTOCOL) + strlen(satellite_url) + strlen(SATELLITE_PING_PATH) + 1));

    strcpy(urlbuffer, SATELLITE_PROTOCOL);
    strcat(urlbuffer, satellite_url);
    strcat(urlbuffer, SATELLITE_PING_PATH);

    struct curl_slist * hs = NULL;
    hs = curl_slist_append(hs, "Content-Type: application/json");
    curl_easy_setopt(curl_handle, CURLOPT_HTTPHEADER, hs);
    curl_easy_setopt(curl_handle, CURLOPT_URL, urlbuffer);
    curl_easy_setopt(curl_handle, CURLOPT_WRITEFUNCTION, SaveChunkCallback);
    curl_easy_setopt(curl_handle, CURLOPT_WRITEDATA, (void *)&chunk);
    curl_easy_setopt(curl_handle, CURLOPT_USERAGENT, SATELLITE_USERAGENT);
    curl_easy_setopt(curl_handle, CURLOPT_POSTFIELDS, post_string);

    res = curl_easy_perform(curl_handle);
    free((void*)post_string);

    if(res != CURLE_OK) {
        fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        curl_easy_cleanup(curl_handle);
        return 2;
    }

    if(query_time != NULL){
        curl_easy_getinfo(curl_handle, CURLINFO_NAMELOOKUP_TIME, &nslookup_time);
        curl_easy_getinfo(curl_handle, CURLINFO_TOTAL_TIME, &total_time);
        (*query_time) = total_time - nslookup_time;
    }

    long http_code;
    curl_easy_getinfo(curl_handle, CURLINFO_RESPONSE_CODE, &http_code);
    if(http_code != 200){
        printf("Satellite didn't accept out ping, status code %ld\n", http_code);
        curl_easy_cleanup(curl_handle);
        free(chunk.memory);
        return http_code;
    }
    
    printf("%lu bytes retrieved\n", (unsigned long)chunk.size);

    curl_easy_cleanup(curl_handle);
    free(chunk.memory);
    return 0;
}
