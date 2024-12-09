import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [faces, setFaces] = useState([]); // Store detected faces
  const [permission, requestPermission] = useCameraPermissions();
  const [verificationResults, setVerificationResults] = useState(null); // Store API response
  const [detectedImage, setDetectedImage] = useState(null); // Store detected faces image path
  const serverIP = '192.168.0.105';


  const cameraRef = useRef(null);
  const params = useLocalSearchParams();
  const { id } = params; // Extract the `id` parameter

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }


  //capture image
  const captureImage = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      const { uri, width, height } = photo;
  
      const formData = new FormData();
      formData.append('image', {
        uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });
      formData.append('width', width.toString());
      formData.append('height', height.toString());
      formData.append('user_id', id);  // Send user_id as part of the request
  
      try {
        const response = await axios.post(`http://${serverIP}:8000/verify_face/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        // console.log('Number of faces detected:', response.data.faces.length); // Log number of faces
        const { verification_results, detected_image_path } = response.data;
        const newDetectedImage = `http://${serverIP}:8000/${detected_image_path}?t=${new Date().getTime()}`;

        // Update state with verification results and detected image
        setVerificationResults(verification_results);
        setDetectedImage(newDetectedImage);
        console.log(newDetectedImage);
        } catch (error) {
          alert('No face detected!');
}
    }
  };

  return (
    <View style={styles.container}>
      {!verificationResults ? (
        <>
          <CameraView style={styles.camera} facing={facing} ref={cameraRef} animateShutter={false}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={captureImage}>
                <Text style={styles.text}>Capture</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          {detectedImage && (
            <Image source={{ uri: detectedImage }} style={styles.detectedImage} />
          )}
          <Text style={styles.resultHeader}>Verification Results</Text>
          {verificationResults.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <Text>Face {index + 1}:</Text>
              <Text>Verified: {result.verified ? 'Yes' : 'No'}</Text>
              <Text>Similarity: {(result.similarity * 100).toFixed(2)}%</Text>
              <Text>Distance: {result.distance.toFixed(4)}</Text>
            </View>
          ))}
          <Button
            title="Capture Again"
            onPress={() => {
              setVerificationResults(null); // Reset results to retake photo
            }}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    width: 350, // Set a fixed width
    borderRadius: 150, // Make it circular (width/2)
    overflow: 'hidden', // Ensure content stays within the circle
    alignSelf: 'center', // Center the camera on the screen
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  resultsContainer: {
    alignItems: 'center',
    padding: 16,
  },
  detectedImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  resultHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultItem: {
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '90%',
  },
});