#!/bin/sh

cd procurement-manager

if [ -e nohup.out ]
then
    rm nohup.out
fi

nohup npm run start &

echo "Started procurement manager"
