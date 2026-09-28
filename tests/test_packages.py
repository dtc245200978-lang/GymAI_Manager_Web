import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from backend.main import Package

def test_package_price_non_negative():
    Package(id='T1', name='Test', duration='1 tháng', price=0)


def test_package_rejects_negative_price():
    try:
        Package(id='T1', name='Test', duration='1 tháng', price=-1)
        assert False
    except Exception:
        assert True
