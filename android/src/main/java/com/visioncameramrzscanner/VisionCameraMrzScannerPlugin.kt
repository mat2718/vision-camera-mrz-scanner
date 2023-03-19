package com.visioncameramrzscanner

import android.annotation.SuppressLint
import android.graphics.Point
import android.graphics.Rect
import android.media.Image
import android.util.Log
import androidx.camera.core.ImageProxy
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.google.android.gms.tasks.Task
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.Text
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin

class VisionCameraMrzScannerPlugin: FrameProcessorPlugin("scanMRZ"){

  private fun getBlockArray(blocks: MutableList<Text.TextBlock>): WritableNativeArray {
    val blockArray = WritableNativeArray()

    try {
        Log.d("VisionCameraMrzScanner", "blocks: ${blocks.size}")
        for (block in blocks) {
            val blockMap = WritableNativeMap()
    
            blockMap.putString("text", block.text)
            blockMap.putArray("recognizedLanguages", getRecognizedLanguages(block.recognizedLanguage))
            blockMap.putArray("cornerPoints", block.cornerPoints?.let { getCornerPoints(it) })
            blockMap.putMap("frame", getFrame(block.boundingBox))
            blockMap.putArray("lines", getLineArray(block.lines))
    
            blockArray.pushMap(blockMap)
        }
    }
    catch(e: Exception) {
        Log.e("VisionCameraMrzScanner", "Error: ${e.message}")
        e.printStackTrace()
    }
    return blockArray
}


private fun getLineArray(lines: MutableList<Text.Line>): WritableNativeArray {
    val lineArray = WritableNativeArray()
    try {
        Log.d("VisionCameraMrzScanner", "lines: ${lines.size}")
        for (line in lines) {
            val lineMap = WritableNativeMap()
    
            lineMap.putString("text", line.text)
            lineMap.putArray("recognizedLanguages", getRecognizedLanguages(line.recognizedLanguage))
            lineMap.putArray("cornerPoints", line.cornerPoints?.let { getCornerPoints(it) })
            lineMap.putMap("frame", getFrame(line.boundingBox))
            lineMap.putArray("elements", getElementArray(line.elements))
    
            lineArray.pushMap(lineMap)
        }
    } catch (e: Exception) {
        Log.e("VisionCameraMrzScanner", "Error: ${e.message}")
    }
    return lineArray
}

private fun getElementArray(elements: MutableList<Text.Element>): WritableNativeArray {
    val elementArray = WritableNativeArray()
    try {
        Log.d("VisionCameraMrzScanner", "elements: ${elements.size}")
        for (element in elements) {
            val elementMap = WritableNativeMap()
    
            elementMap.putString("text", element.text)
            elementMap.putArray("cornerPoints", element.cornerPoints?.let { getCornerPoints(it) })
            elementMap.putMap("frame", getFrame(element.boundingBox))
        }
    } catch (e: Exception) {
        Log.e("VisionCameraMrzScanner", "Error: ${e.message}")
    }
    return elementArray
}

private fun getRecognizedLanguages(recognizedLanguage: String): WritableNativeArray {
    val recognizedLanguages = WritableNativeArray()
    try {
        Log.d("VisionCameraMrzScanner", "recognizedLanguage: ${recognizedLanguage}")
        recognizedLanguages.pushString(recognizedLanguage)
    } catch (e: Exception) {
        Log.e("VisionCameraMrzScanner", "Error: ${e.message}")
    }
    return recognizedLanguages
}

private fun getCornerPoints(points: Array<Point>): WritableNativeArray {
    val cornerPoints = WritableNativeArray()
    try {
        Log.d("VisionCameraMrzScanner", "points: ${points.size}")
        for (point in points) {
            val pointMap = WritableNativeMap()
            pointMap.putInt("x", point.x)
            pointMap.putInt("y", point.y)
            cornerPoints.pushMap(pointMap)
        }
    }
    catch(e: Exception) {
        Log.e("VisionCameraMrzScanner", "Error: ${e.message}")
    }
    return cornerPoints
}

private fun getFrame(boundingBox: Rect?): WritableNativeMap {
    val frame = WritableNativeMap()
    try {
        Log.d("VisionCameraMrzScanner", "boundingBox: ${boundingBox}")
        if (boundingBox != null) {
            frame.putDouble("x", boundingBox.exactCenterX().toDouble())
            frame.putDouble("y", boundingBox.exactCenterY().toDouble())
            frame.putInt("top", boundingBox.top)
            frame.putInt("left", boundingBox.left)
            frame.putInt("right", boundingBox.right)
            frame.putInt("bottom", boundingBox.bottom)
            frame.putInt("width", boundingBox.width())
            frame.putInt("height", boundingBox.height())
            frame.putInt("boundingCenterX", boundingBox.centerX())
            frame.putInt("boundingCenterY", boundingBox.centerY())
        }
    }
    catch(e: Exception) {
        Log.e("VisionCameraMrzScanner", "Error: ${e.message}")
    }
    return frame
}

@SuppressLint("NewApi")
override fun callback(frame: ImageProxy, params: Array<Any>): Any? {

    val result = WritableNativeMap()    
    
    val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
    @SuppressLint("UnsafeOptInUsageError")
    val mediaImage: Image? = frame.getImage()

    if (mediaImage != null) {
        return try {
            val image = InputImage.fromMediaImage(mediaImage, frame.imageInfo.rotationDegrees)
            val task: Task<Text> = recognizer.process(image)
                val text: Text = Tasks.await<Text>(task)
                result.putString("text", text.text)
                result.putArray("blocks", getBlockArray(text.textBlocks))
                val data = WritableNativeMap()
                data.putMap("result", result)
                return data
        } catch (e: Exception) {
            Log.e("VisionCameraMrzScanner", "Error: ${e.message}")
            e.printStackTrace()
        }
    }
    return null 
}
}
