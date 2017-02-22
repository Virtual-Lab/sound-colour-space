# Sync from MAdeK
Commands need a "set" uuid from MAdeK + hardcoded category (either "tone_systems" or "colour_systems"). The category is needed for the virutal museum database.
 
    ./manage.py sync_madek e9f34e2c-b844-4297-b701-7e512c65e3b5 colour_systems
    ./manage.py sync_madek 73114b11-08de-42a9-ba36-864d9c1b5641 tone_systems
    
# Import annotations
CAUTION: this will delete all existing annotations that match KEY columns (ie filename or keyword)

## Precursor
Word documents need to be converted into CSV. This is done by the following conversion steps:
+ In the Microsoft Windows system settings, open 'Region and Language'
+ Click 'Formats' tab and 'Advanced settings'
+ Set the 'list separator' to § (section)
+ Press 'OK' and close system settings
+ Open the document in Microsoft Word
+ With MathType convert all equations to 'MathJax:LaTeX' (in the dialogue check 'Whole document')
+ Select the whole table by clicking the cross on the top left, which appears by hovering near the corner of the table
+ Press Ctrl+h (Search/Replace)
+ Search for ^p^p (double paragraph) and replace all with #### (this must always be done before the next step)
+ Search for ^p (paragraph) and replace all with ##
+ Press Ctrl+c (Copy)
+ Open Microsoft Excel
+ Press Ctrl+v (Paste)
+ Press F12 (Save as)
+ Select CSV (Comma separated values) as file type
+ Save the file (Confirm two times, that you really want to do it)
+ Done!

    
## Import

CSV (commma separated values) can be imported as cp1252 encoded values separated by §
   
Diagrams:

    ./manage.py import_annotations diagrams /path/to/_items_toneSystems_annotations_170105.csv

Sets:

    ./manage.py import_annotations sets /path/to/_itemGroups_annotations_170108.csv
    
Keywords:

    ./manage.py import_annotations keywords /path/to/__madek_keywords_toneSystems_LB_dm.csv


# Parse annotations

Parse Annotations (creates reference links in markdown for related diagrams, sets, primary and secondary sources):

For diagrams:

    ./manage.py parse_related diagrams
    
For sets:

    ./manage.py parse_related sets

For experiments (virtual lab)

    ./manage.py parse_related experiments


Note: Keywords annotations are not being parsed.