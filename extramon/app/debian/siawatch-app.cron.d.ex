#
# Regular cron jobs for the siawatch-app package
#
0 4	* * *	root	[ -x /usr/bin/siawatch-app_maintenance ] && /usr/bin/siawatch-app_maintenance
