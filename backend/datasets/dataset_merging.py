import pandas as pd
import numpy as np
import re

# Load datasets
title_basics = pd.read_csv("title.basics.tsv", sep='\t', na_values='\\N', dtype=str)
title_crew = pd.read_csv("title.crew.tsv", sep='\t', na_values='\\N', dtype=str)
title_episode = pd.read_csv("title.episode.tsv", sep='\t', na_values='\\N', dtype=str)
title_ratings = pd.read_csv("title.ratings.tsv", sep='\t', na_values='\\N', dtype=str)
name_basics = pd.read_csv("name.basics.tsv", sep='\t', na_values='\\N', dtype=str)

# Remove unwanted columns from title_basics
title_basics = title_basics.drop(columns=["originalTitle", "isAdult"])

# Remove entries with titleType == "tvEpisode"
title_basics = title_basics[title_basics["titleType"] != "tvEpisode"]

# Convert startYear and endYear to numeric and remove titles before 1920
title_basics["startYear"] = pd.to_numeric(title_basics["startYear"], errors="coerce")
title_basics["endYear"] = pd.to_numeric(title_basics["endYear"], errors="coerce")
title_basics = title_basics[title_basics["startYear"] >= 1920]

# Convert runtimeMinutes to numeric
title_basics["runtimeMinutes"] = pd.to_numeric(title_basics["runtimeMinutes"], errors="coerce")

# Aggregate episode data
episode_counts = title_episode.groupby("parentTconst").agg(
    totalEpisodes=("tconst", "count")
).reset_index()

# Merge episode count into title_basics on tconst == parentTconst
title_basics = title_basics.merge(episode_counts, left_on="tconst", right_on="parentTconst", how="left")
title_basics = title_basics.drop(columns=["parentTconst"])

# Merge crew data
title_combined = title_basics.merge(title_crew, on="tconst", how="left")

# Replace nconsts with primary names
nconst_map = name_basics.set_index("nconst")["primaryName"].to_dict()

def nconsts_to_names(nconst_str):
    if pd.isna(nconst_str):
        return np.nan
    names = []
    for n in str(nconst_str).split(","):
        n = str(n).strip()
        names.append(str(nconst_map.get(n, n)))
    return ", ".join(names)

title_combined["directors"] = title_combined["directors"].apply(nconsts_to_names)
title_combined["writers"] = title_combined["writers"].apply(nconsts_to_names)

# Merge ratings data
title_combined = title_combined.merge(title_ratings, on="tconst", how="left")

# Convert numVotes to numeric and filter titles with at least 1000 votes
title_combined["numVotes"] = pd.to_numeric(title_combined["numVotes"], errors="coerce")
title_combined = title_combined[title_combined["numVotes"] >= 1000]

# Convert all specified columns to integer, replacing NaN with 0 where appropriate
title_combined["startYear"] = title_combined["startYear"].fillna(0).astype(int)
title_combined["endYear"] = title_combined["endYear"].fillna(0).astype(int)
title_combined["runtimeMinutes"] = title_combined["runtimeMinutes"].fillna(0).astype(int)
title_combined["totalEpisodes"] = title_combined["totalEpisodes"].fillna(0).astype(int)
title_combined["numVotes"] = title_combined["numVotes"].astype(int)

# Filter out entries where titleType is 'video' or 'videoGame'
title_combined = title_combined[~title_combined["titleType"].isin(["video", "videoGame"])]

# Remove quotation marks from all string columns (in the DataFrame)
string_columns = title_combined.select_dtypes(include=["object"]).columns
for column in string_columns:
    title_combined[column] = title_combined[column].astype(str).str.replace('"', '', regex=False)

# Debug: Print a few rows to verify quotation marks are removed from the DataFrame
print("Sample rows before saving (first 2 rows):")
print(title_combined.head(2).to_string())

# Filter: keep only titles with Latin alphabet (including Romanian diacritics)
latin_pattern = re.compile(r'^[\w\s\-\',:;.!?ăĂâÂîÎșȘțȚéÉöÖüÜäÄßçÇñÑøØåÅèÈ]+$')

def is_latin(s):
    if pd.isna(s):
        return False
    return bool(latin_pattern.match(s))

title_combined = title_combined[title_combined["primaryTitle"].apply(is_latin)]

# Replace tconst with integer id starting from 1 after all filtering
title_combined["id"] = range(1, len(title_combined) + 1)
title_combined = title_combined.drop(columns=["tconst"])

# Move id column to the first position
cols = ['id'] + [col for col in title_combined.columns if col != 'id']
title_combined = title_combined[cols]

# Change "primaryTitle" column to "title"
title_combined.rename(columns={"primaryTitle": "title"}, inplace=True)

# Replace 0 with NULL for 'endYear' and 'totalEpisodes'
title_combined['endYear'] = title_combined['endYear'].replace(0, pd.NA)
title_combined['totalEpisodes'] = title_combined['totalEpisodes'].replace(0, pd.NA)

# Save final CSV as imdb.csv with default quoting (will add quotes around fields with commas)
title_combined.to_csv("imdb.csv", index=False)

print("Data processing complete. Final CSV saved as imdb.csv")

# Debug: Read and print the first few lines of the saved CSV to verify
with open("imdb.csv", "r", encoding="utf-8") as f:
    print("\nFirst 3 lines of imdb.csv:")
    for i, line in enumerate(f):
        if i < 3:  # Print first 3 lines
            print(line.strip())
        else:
            break