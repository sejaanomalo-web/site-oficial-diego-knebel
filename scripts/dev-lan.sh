#!/usr/bin/env bash
set -euo pipefail

# Pick the first non-loopback IPv4 address.
LAN_IP="$(ifconfig | awk '/inet / && $2 != "127.0.0.1" { print $2; exit }')"

if [[ -z "${LAN_IP}" ]]; then
  echo "Nao foi possivel detectar o IP local automaticamente."
  echo "Execute: ifconfig | grep 'inet '"
else
  echo "Acesse de outro dispositivo: http://${LAN_IP}:5173/"
fi

exec vite premium-landing --host 0.0.0.0 --port 5173 --strictPort
