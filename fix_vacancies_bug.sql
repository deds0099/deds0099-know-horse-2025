-- =====================================================
-- FIX: Corrige vacancies_left que estão maiores que vacancies
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Ver quais minicursos estão com bug (vacancies_left > vacancies)
SELECT id, title, vacancies, vacancies_left
FROM minicourses
WHERE vacancies_left > vacancies;

-- Corrigir: define vacancies_left = vacancies para os afetados
UPDATE minicourses
SET vacancies_left = vacancies,
    updated_at = NOW()
WHERE vacancies_left > vacancies;

-- Confirmar resultado
SELECT id, title, vacancies, vacancies_left
FROM minicourses
ORDER BY created_at DESC;
