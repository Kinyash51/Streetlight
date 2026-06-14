alter table public.profiles
  add column if not exists reader_theme text
    check (reader_theme is null or reader_theme in ('dark', 'amber', 'paper')),
  add column if not exists reader_font_size numeric
    check (reader_font_size is null or reader_font_size between 14 and 20),
  add column if not exists reader_line_height numeric
    check (reader_line_height is null or reader_line_height between 1.6 and 2.2),
  add column if not exists reader_mode text
    check (reader_mode is null or reader_mode in ('scroll', 'page')),
  add column if not exists reader_wide boolean;
