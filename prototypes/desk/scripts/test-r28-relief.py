"""Cheap source-blend checks: a jump in source resolution must not make a seam."""
from pathlib import Path
import sys, unittest
P = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(P/'.geometry-tools'),str(P.parents[1]/'art-masters/R22/python-tools')]
import numpy as np
from relief_surface import smootherstep, source_weight, continuous_surface

class ReliefSurfaceTests(unittest.TestCase):
    def test_source_edges_have_no_step_or_slope_break(self):
        # Deliberately disagreeing sources expose a hard source substitution.
        for x in [-86,-84,-75,-73]:
            t=np.array([x-.0001,x,x+.0001])
            w=source_weight(t,37,[-86,31,-73,43])
            self.assertLess(float(abs(w[2]-w[0])),1e-9)
            self.assertLess(float(abs(w[0]-2*w[1]+w[2])),1e-9)
        for y in [31,33,41,43]:
            w=source_weight(-79,np.array([y-.0001,y,y+.0001]),[-86,31,-73,43])
            self.assertLess(float(abs(w[2]-w[0])),1e-9)
            self.assertLess(float(abs(w[0]-2*w[1]+w[2])),1e-9)

    def test_equal_slopes_keep_identical_density_through_source_margin(self):
        # Linear ground sampled at two resolutions must stay one linear ground.
        extent=[-90,28,-70,46];fine_extent=[-86,31,-73,43]
        def ramp(box,w,h):
            lon=box[0]+(np.arange(w)+.5)*(box[2]-box[0])/w
            lat=box[3]-(np.arange(h)+.5)*(box[3]-box[1])/h
            return (500+lon[None,:]*30+lat[:,None]*70).astype(np.float32)
        c=ramp(extent,200,180);f=ramp(fine_extent,520,480)
        a=continuous_surface(c,extent,f,np.ones_like(f),fine_extent,.05)
        expected=ramp(extent,400,360)
        # Ignore the coarse raster's outer half-cell, outside every fine margin.
        self.assertLess(float(abs(a[2:-2,2:-2]-expected[2:-2,2:-2]).max()),.001)

    def test_missing_fine_samples_reuse_coarse_elevation(self):
        c=np.full((10,10),250,dtype=np.float32);f=np.zeros((20,20),dtype=np.float32)
        a=continuous_surface(c,[-90,28,-70,46],f,np.zeros_like(f),[-86,31,-73,43],.2)
        self.assertTrue(np.all(a==250))

if __name__=='__main__':unittest.main()
