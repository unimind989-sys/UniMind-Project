"""Package only the manifest-bound delivery artifacts with stable ZIP metadata."""
from pathlib import Path
import json
import hashlib
import zipfile

BASE=Path(__file__).parent
manifest=json.loads((BASE/'asset-manifest.json').read_text(encoding='utf-8'))
names=sorted(manifest['sha256'])
for name in names:
    assert hashlib.sha256((BASE/name).read_bytes()).hexdigest()==manifest['sha256'][name], name
names.append('asset-manifest.json')
dest=BASE/'unimind-open-folio-kit.zip'
with zipfile.ZipFile(dest,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
    for name in names:
        info=zipfile.ZipInfo('unimind-open-folio-kit/'+name,date_time=(2026,9,30,0,0,0))
        info.compress_type=zipfile.ZIP_DEFLATED
        info.external_attr=0o100644<<16
        archive.writestr(info,(BASE/name).read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
with zipfile.ZipFile(dest) as archive:
    assert archive.testzip() is None
    assert len(archive.namelist())==len(names)
    for name in names:
        assert archive.read('unimind-open-folio-kit/'+name)==(BASE/name).read_bytes()
digest=hashlib.sha256(dest.read_bytes()).hexdigest()
(BASE/'archive-sha256.txt').write_text(digest+'  unimind-open-folio-kit.zip\n',encoding='utf-8',newline='\n')
print('Packaged',len(names),'files;',dest.stat().st_size,'bytes; SHA-256',digest)
