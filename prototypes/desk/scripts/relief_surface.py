"""Continuous, deterministic elevation sampling, shared by every relief band."""
import math
import numpy as np
from PIL import Image

def smootherstep(t):
    """C2 transition: value, slope and curvature meet at both source margins."""
    t = np.clip(t, 0, 1)
    return t*t*t*(t*(t*6-15)+10)

def source_weight(lon, lat, extent, margin=2):
    west, south, east, north = extent
    x = np.minimum((lon-west)/margin, (east-lon)/margin)
    y = np.minimum((lat-south)/margin, (north-lat)/margin)
    return smootherstep(x)*smootherstep(y)

def bilinear(a, extent, lon, lat):
    west, south, east, north = extent
    x = np.clip((lon-west)/(east-west)*a.shape[1]-.5, 0, a.shape[1]-1)
    y = np.clip((north-lat)/(north-south)*a.shape[0]-.5, 0, a.shape[0]-1)
    col = np.floor(x).astype(int); row = np.floor(y).astype(int)
    nx = np.minimum(col+1, a.shape[1]-1); ny = np.minimum(row+1, a.shape[0]-1)
    tx = x-col; ty = y-row
    return ((a[row, col]*(1-tx)+a[row, nx]*tx)*(1-ty)
            +(a[ny, col]*(1-tx)+a[ny, nx]*tx)*ty)

def read_3dep(source, width, height):
    """Sparse TIFF blocks are missing data, never invented zero-height plateaux."""
    image = Image.open(source); tags = image.tag_v2
    assert tags[259] == 1 and tags[258] == (32,) and tags[339] == (3,)
    raw = source.read_bytes(); endian = '<' if raw[:2] == b'II' else '>'
    a = np.zeros((height, width), dtype=np.float32); valid = np.zeros(a.shape, dtype=np.float32)
    tw, th = tags[322], tags[323]; columns = math.ceil(width/tw); missing = []
    for i, (offset, count) in enumerate(zip(tags[324], tags[325])):
        row, col = divmod(i, columns); y, x = row*th, col*tw
        hh = min(th, height-y); ww = min(tw, width-x)
        if not offset or not count:
            missing.append(i); continue
        assert count == tw*th*4 and offset+count <= len(raw)
        tile = np.frombuffer(raw[offset:offset+count], dtype=endian+'f4').reshape(th, tw)[:hh, :ww]
        good = np.isfinite(tile)&(tile > -100)&(tile < 10000)
        a[y:y+hh, x:x+ww] = np.where(good, tile, 0)
        valid[y:y+hh, x:x+ww] = good
    return a, valid, missing

def continuous_surface(coarse, coarse_extent, fine, valid, fine_extent, step=.005):
    west, south, east, north = coarse_extent
    width = round((east-west)/step); height = round((north-south)/step)
    result = np.empty((height, width), dtype=np.float32)
    lon = west+(np.arange(width)+.5)*step
    for row in range(height):
        lat = north-(row+.5)*step
        base = bilinear(coarse, coarse_extent, lon, lat)
        reliability = bilinear(valid, fine_extent, lon, lat)
        detail = bilinear(fine, fine_extent, lon, lat)/np.maximum(reliability, 1e-6)
        weight = source_weight(lon, lat, fine_extent)*smootherstep(reliability)
        result[row] = base+(detail-base)*weight
    return result
