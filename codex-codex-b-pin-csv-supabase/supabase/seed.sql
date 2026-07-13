insert into public.course_types (id, name, description, is_active, sort_order) values
('11111111-1111-1111-1111-111111111111','成人初階班','適合第一次接觸匹克球的成人學員',true,1),
('22222222-2222-2222-2222-222222222222','成人進階班','加強策略、步伐與雙打配合',true,2),
('33333333-3333-3333-3333-333333333333','兒童班','適合 6-12 歲孩子',true,3),
('44444444-4444-4444-4444-444444444444','親子班','親子一起上課的友善時段',true,4),
('55555555-5555-5555-5555-555555555555','一對一','客製化個人教學',true,5),
('66666666-6666-6666-6666-666666666666','其他','特殊需求或自組課程',true,6)
on conflict (id) do update set name = excluded.name;

insert into public.classes (id, course_type_id, title, description, weekday, start_time, end_time, period, location, coach_name, price, minimum_students, maximum_students, registration_deadline, status, is_public) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1','11111111-1111-1111-1111-111111111111','成人初階週一早班','從握拍、發球與基本規則開始。',1,'08:00','10:00','morning','寶亮生活學苑 A 場','林教練',1200,4,8,current_date + 30,'recruiting',true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2','22222222-2222-2222-2222-222222222222','成人進階週二晚班','進階戰術與實戰演練。',2,'19:00','21:00','evening','寶亮生活學苑 B 場','陳教練',1600,4,8,current_date + 25,'recruiting',true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3','33333333-3333-3333-3333-333333333333','兒童週三下午班','孩子友善節奏，注重安全與樂趣。',3,'15:00','17:00','afternoon','寶亮生活學苑 A 場','王教練',1000,4,6,current_date + 20,'recruiting',true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4','44444444-4444-4444-4444-444444444444','親子週六早班','親子共同體驗匹克球。',6,'10:00','12:00','morning','寶亮生活學苑 C 場','張教練',1800,4,8,current_date + 18,'recruiting',true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5','55555555-5555-5555-5555-555555555555','一對一週四晚班','依個人程度安排訓練。',4,'20:00','22:00','evening','寶亮生活學苑 A 場','林教練',2400,1,1,current_date + 14,'recruiting',true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6','11111111-1111-1111-1111-111111111111','成人初階週日下午班','週日下午輕鬆入門。',7,'14:00','16:00','afternoon','寶亮生活學苑 B 場','陳教練',1200,4,8,current_date + 28,'recruiting',true)
on conflict (id) do nothing;
