#!/bin/bash

cd ../front/agent-connect
yarn install
yarn build
cd -
nest build core-fca-high
# ajout des fichiers statiques dans le bon dossier
mkdir ./dist/instances/core-fca-high/public
cp -r ../front/agent-connect/build/** ./dist/instances/core-fca-high/public
# changement extension .html en .ejs pour pouvoir le récupérer dans le render
mv ./dist/instances/core-fca-high/public/index.html ./dist/instances/core-fca-high/views/interaction.ejs
