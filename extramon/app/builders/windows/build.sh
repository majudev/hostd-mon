#!/bin/bash

function check_status {
	if ! [ $? -eq 0 ]; then
		echo "Last command failed"
		exit $?
	fi
}

echo "Installing dependencies"
dnf -y install \
	cmake \
	mingw64-gcc \
	mingw64-gcc-c++ \
	mingw64-gtk3 \
	mingw64-curl \
	mingw64-jansson \
	mingw32-binutils \
	mingw32-nsiswrapper \
	mingw64-adwaita-icon-theme \
	wget \
	git \
	zip

check_status

mkdir -p /app/build
cd /app/build

echo "Setting up project"
cmake \
	-DPKG_CONFIG_EXECUTABLE=/usr/bin/mingw64-pkg-config \
	-DCMAKE_INSTALL_PREFIX=/app/sysroot \
	-DCMAKE_TOOLCHAIN_FILE=/usr/share/mingw/toolchain-mingw64.cmake \
	/source

check_status

make -j$(nproc)

check_status

make install

check_status

mkdir -p /app/sysroot/bin
cp /usr/x86_64-w64-mingw32/sys-root/mingw/bin/* /app/sysroot/bin
for f in /app/sysroot/bin/*; do
	if [ "`echo $f | grep -c \.exe\$`" -gt 0 ]; then
		if [ "`basename \"$f\" | grep -c extramon`" -eq 0 ]; then
			rm "$f"
		fi
	elif [ "`echo $f | grep -c \.dll\$`" -eq 0 ]; then
		rm "$f"
	fi
done
wget https://curl.se/ca/cacert.pem -O /app/sysroot/bin/curl-ca-bundle.crt
#mkdir -p /app/sysroot/share/themes
#cp -r /usr/x86_64-w64-mingw32/sys-root/mingw/share/themes/* /app/sysroot/share/themes
mkdir -p /app/sysroot/etc
cp -r /usr/x86_64-w64-mingw32/sys-root/mingw/etc/* /app/sysroot/etc
cp -r /usr/x86_64-w64-mingw32/sys-root/mingw/share/* /app/sysroot/share

cd /app/sysroot
zip -9 -r ../archive.zip .
