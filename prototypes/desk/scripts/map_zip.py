"""Read the publisher's ZIP bytes without modifying them; validate every member's CRC."""
import io, zipfile
def open_zip(data):
    archive=zipfile.ZipFile(io.BytesIO(data))
    adjustment=0
    # Some Newberry archives have extra local records before the final central directory.
    # Python compensates as for a self-extracting zip, shifting all recorded offsets.
    # Accept a correction only when ALL declared local headers match exactly by name.
    first=archive.infolist()[0]
    if data[first.header_offset:first.header_offset+4] != b'PK\x03\x04':
        adjustment=first.header_offset
        for entry in archive.infolist():
            at=entry.header_offset-adjustment
            if at < 0 or data[at:at+4] != b'PK\x03\x04': raise ValueError('ZIP offsets are not consistently recoverable')
            n=int.from_bytes(data[at+26:at+28],'little')
            if data[at+30:at+30+n].decode('cp437') != entry.filename: raise ValueError('ZIP local/central filename mismatch')
        for entry in archive.infolist():
            entry.header_offset-=adjustment
    for entry in archive.infolist(): archive.read(entry)  # includes zero-length directories and all metadata
    archive.r18_offset_adjustment=adjustment
    return archive
