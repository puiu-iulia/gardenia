import React, { useState, useReducer, useEffect, useCallback } from 'react';
import { Image, Text, StyleSheet, View, Dimensions, KeyboardAvoidingView, Button, ActivityIndicator, Alert, } from 'react-native';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-simple-toast';

import Input from '../components/Input';
import Card from '../components/Card';
import Colors from '../constants/Colors';
import * as authActions from '../store/actions/auth';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

const formReducer = (state, action) => {
    if (action.type === FORM_INPUT_UPDATE) {
      const updatedValues = {
        ...state.inputValues,
        [action.input]: action.value
      };
      const updatedValidities = {
        ...state.inputValidities,
        [action.input]: action.isValid
      };
      let updatedFormIsValid = true;
      for (const key in updatedValidities) {
        updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
      }
      return {
        formIsValid: updatedFormIsValid,
        inputValidities: updatedValidities,
        inputValues: updatedValues
      };
    }
    return state;
  };

const AuthScreen = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const [isSignin, setIsSignin] = useState(true);
    const dispatch = useDispatch();

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
          email: '',
          password: ''
        },
        inputValidities: {
          email: false,
          password: false
        },
        formIsValid: false
    });

    useEffect(() => {
        if (error) {
          Alert.alert('A avut loc o eroare!', error, [{ text: 'In regula' }]);
        }
      }, [error]);

    const authHandler = async () => {
      let action;
      if (!isSignin) {
        action = authActions.signup(
          formState.inputValues.email,
          formState.inputValues.password
        );
      } else {
        action = authActions.login(
          formState.inputValues.email,
          formState.inputValues.password
        );
      }
      setError(null);
      try {
        setIsLoading(true);
        await dispatch(action);
        setIsLoading(false);
        if (isSignin) {
          props.navigation.navigate('ProductsOverview');
        } else {
          Alert.alert('Contul tau a fost creat cu succes!', 'Acum te poti conecta.', [{ text: 'In regula' }]);
          setIsSignin(true);
        }  
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    const inputChangeHandler = useCallback(
        (inputIdentifier, inputValue, inputValidity) => {
          dispatchFormState({
            type: FORM_INPUT_UPDATE,
            value: inputValue,
            isValid: inputValidity,
            input: inputIdentifier
          });
        },
        [dispatchFormState]
      );

    return (
        <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={50} style={styles.screen}>
                 <View style={styles.imageView}>
                  <Image
                        style={styles.image}
                        source={require('../assets/logoalb.png')}
                  />
                </View>
                <View style={styles.loginContainer}>
                        <Input
                            id="email"
                            placeholder=" Adresa de E-mail"
                            keyboardType="email-address"
                            required
                            email
                            style={styles.input}
                            autoCapitalize="none"
                            errorText="Introdu o adresa de email valida."
                            onInputChange={inputChangeHandler}
                            initialValue=''
                        />
                        <Input
                            id="password"
                            placeholder=" Parola"
                            keyboardType="default"
                            style={styles.input}
                            secureTextEntry
                            required
                            minLength={6}
                            autoCapitalize="none"
                            errorText="Introdu o parola de minim 6 caractere."
                            onInputChange={inputChangeHandler}
                            initialValue=''
                        />
                        <View style={styles.buttonContainer} >
                            {isLoading ? (
                               <ActivityIndicator size='large' color={Colors.accent} />
                            ) : (
                                <Button
                                    disabled={(formState.inputValues.email.length == 0) || (formState.inputValues.password.length == 0)} 
                                    title={isSignin ? "Conecteaza-te": "Creaza Cont"} 
                                    color={Colors.accent}
                                    onPress={() => {
                                        authHandler();    
                                    }} 
                                /> 
                            )}
                        </View>
                        <View style={styles.text}><Text style={{fontFamily: 'montserrat', color: 'white'}}>{isSignin ? 'Nu am cont.' : 'Am deja cont.'}</Text></View>
                        <View style={styles.buttonContainer}>           
                            <Button 
                              title={isSignin? "Creaza Cont Nou": "Vreau sa ma conectez"} 
                              color={Colors.accent} 
                              onPress={() => {setIsSignin(prevState => !prevState)}} 
                            />
                        </View>  
                </View>
        </KeyboardAvoidingView> 
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 24
    },
    loginContainer: {
        width: '80%',
        // maxWidth: 600,
        maxHeight: 400,
        padding: 20,
        backgroundColor: Colors.primary
    },
    imageView: {
      height: Dimensions.get('window').height/3.4, 
      width: Dimensions.get('window').width/1.2, 
      alignSelf: 'center', 
      marginBottom: 48
    },
    image: {
      height: '100%', 
      width: '100%',
      marginVertical: 48
    },
    text: {
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white'
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }, 
    buttonContainer: {
        marginTop: 16,
        width: '75%',
        borderRadius: 8,
        overflow: 'hidden',
        alignSelf: 'center',
        marginVertical: 16
    },
    input: {
      fontFamily: 'montserrat',
      color: 'white'
    }
});

export default AuthScreen;
