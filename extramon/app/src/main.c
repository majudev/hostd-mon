#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <secp256k1.h>
#include <curl/curl.h>

#include "urls.h"
#include "fill_random.h"
#include "ping_satellite.h"

int main(int argc, char * argv[]){
    printf("Registered hostd extramon satellites:\n");
    for(int i = 0; i < satellite_urls_size; ++i){
        printf(" - %s\n", satellite_urls[i]);
    }

    char * privkey_path = "./private.key";

    for(int i = 1; i+1 < argc; i += 2){
        if(!strcmp(argv[i], "--privkey")){
            privkey_path = argv[i+1];
        }
    }

    printf("Creating and randomizing secp256k1 context\n");
    secp256k1_context * ctx = secp256k1_context_create(SECP256K1_CONTEXT_SIGN);
    unsigned char randomize[32];
    if (!fill_random(randomize, sizeof(randomize))) {
        printf("Failed to generate randomness\n");
        secp256k1_context_destroy(ctx);
        return 1;
    }
    if(!secp256k1_context_randomize(ctx, randomize)){
        printf("Cannot randomize context\n");
        secp256k1_context_destroy(ctx);
        return 1;
    }

    unsigned char privkey[32];
    printf("Loading private key from %s\n", privkey_path);
    FILE * file = fopen(privkey_path, "r");
    if(file == NULL){
        printf("Cannot open file, generating random key...\n");
        while (1) {
            if (!fill_random(privkey, sizeof(privkey))) {
                printf("Failed to generate randomness, dying\n");
                secp256k1_context_destroy(ctx);
                return 1;
            }
            if (secp256k1_ec_seckey_verify(ctx, privkey)) {
                break;
            }
        }

        printf("Writing newly generated key to disk (path %s)\n", privkey_path);
        file = fopen(privkey_path, "w");
        if(file == NULL){
            printf("Cannot write generated privkey to %s, dying\n", privkey_path);
            secp256k1_context_destroy(ctx);
            return 1;
        }
        
        for (size_t i = 0; i < sizeof(privkey); ++i) {
            fprintf(file, "%02x", privkey[i]);
        }
    }else{
        unsigned char hex_privkey[64];

        fseek(file, 0, SEEK_END);
        long file_size = ftell(file);
        fseek(file, 0, SEEK_SET);

        if(file_size == sizeof(hex_privkey) + 1) file_size -= 1;
        if(file_size != sizeof(hex_privkey)){
            printf("Privkey file contains wrong amount of data, dying.\n");
            printf("Please remove the file to auto-regenerate the privkey.\n");
            secp256k1_context_destroy(ctx);
            return 1;
        }
    
        size_t bytes_read = fread(hex_privkey, 1, file_size, file);
        if (bytes_read != file_size) {
            perror("Error reading file");
            fclose(file);
            secp256k1_context_destroy(ctx);
            return 1;
        }

        for (size_t i = 0; i < sizeof(hex_privkey); i += 2) {
            sscanf(&hex_privkey[i], "%2hhx", &privkey[i / 2]);
        }

        if(!secp256k1_ec_seckey_verify(ctx, privkey)){
            printf("Provided privkey fails verification. It probably means that it's invalid.\n");
            secp256k1_context_destroy(ctx);
            return 1;
        }
    }

    fclose(file);

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
    secp256k1_context_destroy(ctx);

    printf("Our pubkey is: ");
    for(int i = 0; i < len; ++i){
        printf("%02x", compressed_pubkey[i]);
    }
    printf("\n");

    curl_global_init(CURL_GLOBAL_ALL);

    printf("Pinging satellites\n");
    int satellite_green = 0;
    for(int i = 0; i < satellite_urls_size; ++i){
        const char * satellite_url = satellite_urls[i];
        int res = ping_satellite(satellite_url, privkey);
        satellite_green = satellite_green || (res == 0);
        printf(" - %s: %s\n", satellite_url, (res == 0) ? "OK" : ((res == 2) ? "SERVER UNREACHABLE" : ((res == 401) ? "UNAUTHORIZED" : ((res / 100 == 5) ? "SERVER ERROR" : "OTHER ERROR"))));
    }

    if(!satellite_green){
        printf("Couldn't ping any satellite. Please go to %s and add this PC as client. Use the following pubkey: ", REGISTER_MON_PAGE);
        for(int i = 0; i < len; ++i){
            printf("%02x", compressed_pubkey[i]);
        }
        printf("\n");
        curl_global_cleanup();
        return 0;
    }

    

    curl_global_cleanup();

    return 0;
}
