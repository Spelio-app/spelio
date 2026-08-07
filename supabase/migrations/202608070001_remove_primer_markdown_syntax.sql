begin;

update public.word_lists
set primer_content = primer_content || jsonb_build_object(
  'bodyEn', 'In Welsh, si often sounds like the “sh” in the English word “shop”.' || E'\n\n'
    || 'This is especially common when si is followed by another vowel, as in siop and siarad.' || E'\n\n'
    || 'There are a few exceptions, but learning this pattern will help you recognise many common Welsh words.',
  'bodyCy', 'Yn Gymraeg, mae si yn aml yn swnio fel “sh” yn y gair Saesneg “shop”.' || E'\n\n'
    || 'Mae hyn yn arbennig o gyffredin pan fydd si yn cael ei ddilyn gan lafariad arall, fel yn siop a siarad.' || E'\n\n'
    || 'Mae ambell eithriad, ond bydd dysgu''r patrwm hwn yn eich helpu i adnabod llawer o eiriau Cymraeg cyffredin.'
)
where id = 'foundation_patterns_si';

update public.words
set usage_note = 'Notice how si sounds before another vowel.'
where id = 'foundation_patterns_si_004';

commit;
