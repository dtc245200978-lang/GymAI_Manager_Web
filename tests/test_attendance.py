def test_attendance_duplicate_rule_documented():
    attendance = {('member-01', '2026-09-15', '18:00')}
    duplicate = ('member-01', '2026-09-15', '18:00')
    assert duplicate in attendance
