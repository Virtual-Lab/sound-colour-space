#!/bin/zsh

# run imports

./manage.py import_annotations diagrams ../data/_items_all_annotations_170222.csv
./manage.py import_annotations sets ../data/_itemGroups_annotations_170222.csv

# run parsing
./manage.py parse_related diagrams
./manage.py parse_related sets

