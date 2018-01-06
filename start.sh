#!/bin/bash
if [ "$1" == "-r" ]
then
	rm server.log
fi
LOGPATH=$PWD/server.log
forever start -l $LOGPATH -a -w main.js
