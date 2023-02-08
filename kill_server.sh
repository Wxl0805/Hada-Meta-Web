#!/bin/bash
pids=`lsof -i:9902 -t`
if [ "$pids" != "" ];
then
  kill -9 $pids
  echo "killed"
else
  echo "not run yet"
fi
