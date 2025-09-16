import requests
import pandas as pd
import json

# URLs for the CSV files
urls = {
    'main_details': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/viaturasDetalhes_export_2025-09-16_155301-PR0LRCgL95J8B4Wa1XsRzebpRNu5tl.csv',
    'oils_filters': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ViaturasDetalhesOilsFilters_export_2025-09-16_155233-fPLfQBBLctqs6DNHyAYGFIVz7oRcri.csv',
    'tires': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ViaturasDetalhesPneus_export_2025-09-16_155239-LRBeuDIA1xXf3yjZcrGF9zJ8MHI0W1.csv',
    'engine': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ViaturasDetalhesMotor_export_2025-09-16_155215-MehyweNVTA9n5r2q3FZ3htzqUKZO4X.csv'
}

def analyze_csv(url, name):
    try:
        print(f"\n=== Analyzing {name} ===")
        response = requests.get(url)
        response.raise_for_status()
        
        # Try to read as CSV
        from io import StringIO
        df = pd.read_csv(StringIO(response.text))
        
        print(f"Columns ({len(df.columns)}):")
        for col in df.columns:
            print(f"  - {col}")
        
        print(f"\nSample data (first 2 rows):")
        print(df.head(2).to_string())
        
        print(f"\nData types:")
        print(df.dtypes.to_string())
        
        return df
        
    except Exception as e:
        print(f"Error analyzing {name}: {str(e)}")
        return None

# Analyze each CSV file
dataframes = {}
for key, url in urls.items():
    df = analyze_csv(url, key)
    if df is not None:
        dataframes[key] = df

print(f"\n=== Summary ===")
print(f"Successfully loaded {len(dataframes)} CSV files")
for name, df in dataframes.items():
    print(f"{name}: {len(df)} rows, {len(df.columns)} columns")
