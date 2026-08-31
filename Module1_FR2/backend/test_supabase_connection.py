from database import supabase


response = (
    supabase
    .table("canvas_records")
    .select("*")
    .limit(1)
    .execute()
)


print("Supabase connection successful!")
print("Response:", response.data)