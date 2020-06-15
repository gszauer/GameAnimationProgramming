var gSkeletonWalkingDemo = null;
            var gBlendingDemo = null;
            var gBezierDemo = null;
            var gWalkingClip = null;

            // This will be removed
            var gSkinnedWalkingDemo = null;
            // End 

            function loop() {
                if (gBezierDemo != null) {
                    gBezierDemo.Loop();
                }
                if (gSkeletonWalkingDemo != null) {
                    gSkeletonWalkingDemo.Loop();
                }
                if (gSkinnedWalkingDemo != null) {
                    gSkinnedWalkingDemo.Loop();
                }
                if (gBlendingDemo != null) {
                	gBlendingDemo.Loop();
                }
            }

            function main() {
                let canvas = document.getElementById("bezierCanvas");
                if (canvas === null) {
                    console.error("Unable to find Bezier Canvas");
                    gBezierDemo = null;
                }
                else {
                    gBezierDemo = new BezierDemo(canvas);
                }

                canvas = document.getElementById("skeletonWalkingCanvas");
                if (canvas === null) {
                    console.error("Unable to find Skeleton Walking Canvas");
                    gSkeletonWalkingDemo = null;
                }
                else {
                    let gl = canvas.getContext("webgl");
                    if (gl === null) {
                        console.error("Unable to get OpenGL context for Skeleton Walking Canvas");
                        gSkeletonWalkingDemo = null;
                    }
                    else {
                        gl.enable(gl.DEPTH_TEST);
                        gl.enable(gl.CULL_FACE);
                        gSkeletonWalkingDemo = new SkeletonAnimated(gl, canvas);
                    }
                }

                canvas = document.getElementById("skinnedWalkingCanvas");
                if (canvas === null) {
                    console.error("Unable to find Skinned Walking Canvas");
                    gSkinnedWalkingDemo = null;
                }
                else {
                    let gl = canvas.getContext("webgl");
                    if (gl === null) {
                        console.error("Unable to get OpenGL context for Skinned Walking Canvas");
                        gSkinnedWalkingDemo = null;
                    }
                    else {
                        gl.enable(gl.DEPTH_TEST);
                        gl.enable(gl.CULL_FACE);
                        gSkinnedWalkingDemo = new FullPageAnimated(gl, canvas);
                    }
                }

                window.setInterval(loop, 16);
            }

            window.onload = main;