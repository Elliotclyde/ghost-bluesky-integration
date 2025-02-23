#!/bin/sh
if [ "$USETITLE" = "TRUE" ]; then
    node index.js --blueskyidentifier "$IDENTIFIER" --blueskypass "$PASS" --usetitle
else
    node index.js --blueskyidentifier "$IDENTIFIER" --blueskypass "$PASS"
fi