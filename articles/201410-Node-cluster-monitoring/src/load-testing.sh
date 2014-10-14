#!/bin/bash

if ! type vegeta 2>&1> /dev/null; then
  echo "You must install Golang (http://golang.org/) and vegeta (https://github.com/tsenart/vegeta) pakcage via 'go get'"
  exit 2
fi

if [[ -z "$1" ]]; then
  echo "You have to provide a name for the test which will be used for the result and reports filename"
  exit 1
fi

echo "Running a 1 minute test"
echo "GET http://localhost:3000/" | vegeta attack -duration=1m > "$1.bin"
cat "$1.bin" | vegeta report -reporter=json > "$1.json"
cat "$1.bin" | vegeta report -reporter=plot > "$1.html"
