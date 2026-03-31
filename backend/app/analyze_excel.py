import pandas as pd

filepath = r'd:\DaiHoc\thuctap\tt\LỊCH TUẦN 10 NĂM 2026.xls'
df = pd.read_excel(filepath, sheet_name='Sheet', header=None, engine='xlrd')

with open(r'd:\DaiHoc\thuctap\tt\thuctap\backend\app\analysis_output2.txt', 'w', encoding='utf-8') as f:
    f.write(f"Shape: {df.shape}\n")
    f.write(f"HEADER (row 7): {list(df.iloc[7].values)}\n\n")
    
    # Print ALL data rows from row 8 onwards
    for j in range(8, min(len(df), 163)):
        row = df.iloc[j]
        vals = []
        for k, v in enumerate(row.values):
            if pd.notna(v):
                s = str(v).strip().replace('\n', ' | ')
                vals.append(f"[{k}] {s[:100]}")
        if vals:
            f.write(f"Row {j}: {' ;; '.join(vals)}\n")
        else:
            f.write(f"Row {j}: (empty)\n")
    
    f.write("\nDone!\n")

print("Written to analysis_output2.txt")
