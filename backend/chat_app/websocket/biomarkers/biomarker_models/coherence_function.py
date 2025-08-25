import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

"""
    Coherence function to calculate Global coherence, Local Coherence, Robot Coherence

    Global coherence: is calculated as the cosine similarity between the current window and the mean of the rest of the windows of user's speech.
    Local coherence: is calculated as the cosine similarity between the current window and the previous window of the user.
    Robot coherence: is calculated as the cosine similarity between the current window of the user and the average of the robot's speech.

    Parameters:
        data (pd.DataFrame): A DataFrame containing the conversation data
        vectors (pd.DataFrame): A DataFrame containing the word vectors
        stop_list (pd.DataFrame): A DataFrame containing the stop words
        entropy (pd.DataFrame): A DataFrame containing the entropy values
        norm (bool): A boolean value to indicate whether to normalize the vectors
        f_weight (str): A string value to indicate the frequency weight to use
        winsize (int): An integer value to indicate the window size
        output_wins (bool): A boolean value to indicate whether to output the windows   

    Returns:
        pd.DataFrame: A DataFrame containing the conversation data with the coherence values appended
"""
def coherence(data, vectors, stop_list=None, entropy=None, norm=True, f_weight='logfreq', winsize=20, output_wins=True):
    # Checking the input data format
    if not isinstance(data, pd.DataFrame):                  raise ValueError('Input data must be a DataFrame')
    if data.shape[1] < 2:                                   raise ValueError('Not enough columns in input')
    if data.shape[1] > 2:                                   raise ValueError('Too many columns in input')
    if not isinstance(vectors, (pd.DataFrame, np.ndarray)): raise ValueError('Word vectors in incorrect format')
    if vectors.shape[0] != len(vectors):                    raise ValueError('Word vectors are not labelled')
    

    if stop_list is not None: stop_list = stop_list.iloc[:, 0].tolist()
    
    if entropy is not None:
        entropy = entropy['x'].to_numpy()
        
        if len(entropy) != vectors.shape[0]:
            raise ValueError('Number of entropy values does not match number of words in vectors')
    
    if f_weight not in ['logfreq', 'freq', 'none']: raise ValueError('Invalid frequency option')
    if winsize < 1:                                 raise ValueError('Invalid window size')
    
    vlength = vectors.shape[1]
    
    
    # Set column names
    try:
        if data.shape[1] == 2: data.columns = ['participants', 'response']
        else:                  raise Exception(f"Number of columns are {data.shape[1]}, just 2 are needed pt and response")
    except Exception as e:     print(f"An error occurred: {e}")

    # Make a copy of the data & add some additional columns
    d2 = data.copy()
    d2[["gc", "lc", "rc"]] = [np.nan, np.nan, np.nan]
    if output_wins: d2['window'] = np.nan

    # Clean and lowercase the "response" text
    speech = data['response'].str.lower().str.replace('[^\w\s]', '').str.strip()

    # Get change points where the speaker changes (check if a rows 'participants' value differs from the previous row)
    new  = data.index[data["participants"] != data["participants"].shift(1)].tolist()
    nnew = len(new)


    allresp = np.zeros((nnew, vlength))
    
    startdata = d2.iloc[new, :]

    # --------------------------------------------------------------------
    # Creating the average robot response
    # --------------------------------------------------------------------
    for j in range(nnew):
        # Collect response
        current_response = speech[new[j]:new[j+1]] if (j < nnew-1) else speech[new[j]:]
        
        # Get words as a series & create a matrix using the value counts
        words = pd.Series([word for word in current_response if word in vectors.index])
        word_counts = words.value_counts()

        if   f_weight == 'logfreq' : words_matrix = np.log10(word_counts + 1).to_frame()
        elif f_weight == 'none'    : words_matrix = pd.DataFrame(1, index=word_counts.index, columns=['count'])
        else:                        words_matrix = word_counts.to_frame()
        words_matrix = words_matrix.sort_index()

        # ...
        w2 = words_matrix if (stop_list is None) else words_matrix.loc[~words_matrix.index.isin(stop_list)]
        mask = vectors.index.isin(w2.index)

        # ...
        vnorm = np.sqrt((vectors.loc[w2.index] ** 2).sum(axis=1)) if (norm               ) else 1
        entro = entropy[mask]                                     if (entropy is not None) else 1

        # Reshape w2.values and entro to align with the dimensions of vectors
        w2_reshaped    = w2   .values.reshape(-1, 1)
        vnorm_reshaped = vnorm.values.reshape(-1, 1)
        entro_reshaped = entro       .reshape(-1, 1)
        
        # Now perform the element-wise multiplication and division
        cvec_values = vectors.loc[w2.index].values * w2_reshaped * entro_reshaped / vnorm_reshaped

        # Convert cvec_values back to a DataFrame with the same index and columns as the original vectors DataFrame
        cvec = pd.DataFrame(cvec_values, index=w2.index, columns=vectors.columns)

        # Assign cvec directly to the corresponding row of allresp
        # If cvec is a single row, just flatten it; otherwise, take the average of all rows
        if cvec.shape[0] == 1: allresp[j, :] = cvec.values.flatten()  
        else:                  allresp[j, :] = cvec.mean(axis=0).values

    # avgrobot= np.nanmean(allresp[startdata['participants'] == 'robot'], axis=0)

    # Calculate coherence for each response in the dataset
    for i in range(nnew):
        start = new[i]
        # if startdata['participants'][new[i]] == "user" or startdata['participants'][new[i]] == "robot":
        if startdata['participants'][new[i]] == "user":
            if i < nnew - 1: currresp = speech[new[i]:new[i+1]]
            else:            currresp = speech[new[i]:]
            
            nwords = len(currresp)

            wins = np.full((nwords, winsize), '', dtype=object)

            winvec = np.zeros((nwords, vlength))
              
            print("wins",wins.shape)

            for j in range(nwords):
                winstart = max(0, j - winsize + 1)  
                winend = j + 1  # Range end is exclusive, so add 1 to include winend

                wins[j, :winend - winstart] = currresp[winstart:winend]
                words = [word for word in wins[j, :] if word in vectors.index]

                word_counts = pd.Series(words).value_counts()
                if f_weight == 'logfreq':
                    words_matrix = np.log10(word_counts + 1).to_frame()
                else:
                    words_matrix = word_counts.to_frame()

                if f_weight == 'none':
                    words_matrix[:] = 1
                
                # Remove stop words, if required
                if stop_list is None:
                    w2 = words_matrix
                else:
                    w2 = words_matrix.loc[~words_matrix.index.isin(stop_list)]
                
                # Custom function to calculate sqrt(sum(x^2))
                def calculate_vector_norm(vec):
                    return np.sqrt(np.sum(vec**2))

                if norm:
                    if len(w2) == 1:
                        # Special case for one word: compute sqrt(sum(x^2)) for a single vector (flattened)
                        vnorm = calculate_vector_norm(vectors.loc[w2.index].values.flatten())
                        # print("in if")
                    else:
                        # General case for multiple words: compute sqrt(sum(x^2)) for each row (word vector)
                        vnorm = vectors.loc[w2.index].apply(calculate_vector_norm, axis=1)
                else:
                    vnorm = 1

                # Handling entropy
                if entropy is None:
                    entro = 1
                else:
                    # Extract entropy values corresponding to the words in w2
                    entro = entropy[vectors.index.isin(w2.index)]


                try:
                    # Reshape w2.values.flatten() and entro to align with the dimensions of vectors
                    w2_reshaped = w2.values.flatten().reshape(-1, 1)  
                    entro_reshaped = entro.reshape(-1, 1)             
                    vnorm_reshpaed = np.array(vnorm).reshape(-1,1)
                    w2_array = np.nan_to_num(w2_reshaped, nan=0)
                    entro_array = np.nan_to_num(entro_reshaped, nan=0)
                    vnorm_array = np.nan_to_num(vnorm_reshpaed, nan=0)
                    # Calculate cvec
                    cvec = pd.DataFrame(vectors.loc[w2.index].values * w2_array * entro_array / vnorm_array,index=w2.index, columns=vectors.columns)
                except Exception as e:
                    print(f"Error occurred: {e}")
                    continue

                if cvec.ndim == 1:  # equivalent to 'numeric' check in R
                    winvec[j, :] = cvec
                else:
                    # Compute the column means of cvec
                    winvec[j, :] = cvec.mean(axis=0)


            winvec = np.nan_to_num(winvec, nan=0)

            for i in range(nwords):
                current_window = winvec[i, :].reshape(1, -1)
                #Robot Coherence
                # d2.loc[start + i, 'rc'] = cosine_similarity(avgrobot.reshape(1, -1), current_window)[0, 0]

                
                #Local Coherence
                # if i < winsize:
                #     d2.loc[start + i, 'lc'] = None  # No previous window available, set to None
                # else:
                #     d2.loc[start + i, 'lc'] = cosine_similarity(current_window, winvec[i - winsize, :].reshape(1, -1))[0, 0]  # Compare with previous window (no overlap)

                #Cosine Similarity between current window and mean of rest of the windows
                
                if i < winsize:
                    d2.loc[start + i, 'gc'] = None  # No previous window available, set to None
                else:
                    mean_other_windows = np.nanmean(np.vstack([winvec[i - winsize:i, :], winvec[i + 1:, :]]), axis=0)
                    # mean_other_windows =+ avgrobot
                    mean_other_windows = mean_other_windows.reshape(1, -1)
                    d2.loc[start + i, 'gc'] = cosine_similarity(current_window, mean_other_windows)[0, 0]  # Compare with previous window (no overlap)
                          

                if output_wins:
                    d2.loc[start + i, 'window'] = ' '.join(wins[i, :])

    filtered_df = d2[d2['participants'] == 'user']

    # Calculate the mean of column 'C' for the filtered rows
    # mean_rc_coherence = filtered_df['rc'].mean()
    # mean_lc_coherence = filtered_df['lc'].mean()
    mean_gc_coherence = filtered_df['gc'].mean()

    

    # return mean_rc_coherence,mean_lc_coherence,mean_gc_coherence
    return mean_gc_coherence



# ======================================================================= ===================================
# Redo
# ======================================================================= ===================================
# Work in progress, trying to make this code cleaner/more understandable...
# Also may be easier to calculate some of these things with the format of the data...

# Custom function to calculate sqrt(sum(x^2))
def calculate_vector_norm(vec):
    return np.sqrt(np.sum(vec**2))

def coherence_v2(context_buffer, data, vectors, entropy, stop_list, f_weight="logfreq", norm=True, winsize=20,):
    vlength = vectors.shape[1]

    # Okay for now we will just go with it
    df = data.copy()
    df.columns = ["participants", "response"]
    df[["global_coherence", "local_coherence", "robot_coherence"]] = [np.nan, np.nan, np.nan]

    # Clean and lowercase the "response" text
    speech = data["response"].str.lower().str.replace('[^\w\s]', '').str.strip()

    # Get change points where the speaker changes (check if a rows 'participants' value differs from the previous row)
    new  = data.index[data["participants"] != data["participants"].shift(1)].tolist()
    nnew = len(new)

    allresp = np.zeros((nnew, vlength))
    
    startdata = df.iloc[new, :]

    # --------------------------------------------------------------------
    # Calculate coherence for each response in the dataset
    # --------------------------------------------------------------------
    """
    So we have speaker change points, we use those to get complete utterances.
    Then 
    """
    # For each of the messages... (only use the users speech)
    for i in range(len(context_buffer)):
        # ---- Sometimes we might do both though? ----
        if context_buffer[i][0] != "user": continue

        # Prepare the data
        text    = context_buffer[i][1].lower().replace('[^\w\s]', '').strip()
        n_words = len(text)
        windows = np.full ((n_words, winsize), '', dtype=object)
        win_vec = np.zeros((n_words, vlength))

        # =======================================================================
        # 
        # =======================================================================
        for j in range(n_words):
            winstart = max(0, j - winsize + 1)  
            winend = j + 1  # Range end is exclusive, so add 1 to include winend

            windows[j, :winend - winstart] = text[winstart:winend]
            words = [word for word in windows[j, :] if word in vectors.index]

            word_counts = pd.Series(words).value_counts()

            if   f_weight == 'logfreq' : words_matrix = np.log10(word_counts + 1).to_frame()
            elif f_weight == 'none'    : words_matrix = pd.DataFrame(1, index=word_counts.index, columns=['count'])
            else:                        words_matrix = word_counts.to_frame()
            words_matrix = words_matrix.sort_index()
            
            # --------------------------------------------------------------------
            # Stop words, normalization, & entropy
            # --------------------------------------------------------------------
            # Remove stop words if required
            w2 = words_matrix if (stop_list is None) else words_matrix.loc[~words_matrix.index.isin(stop_list)]
  
            # Special case for one word: compute sqrt(sum(x^2)) for a single vector (flattened)
            # General case for multiple words: compute sqrt(sum(x^2)) for each row (word vector)
            if   norm and len(w2) == 1: vnorm = calculate_vector_norm(vectors.loc[w2.index].values.flatten())
            elif norm:                  vnorm = vectors.loc[w2.index].apply(calculate_vector_norm, axis=1)
            else:                       vnorm = 1
    
            # Extract entropy values corresponding to the words in w2
            entro = 1 if (entropy is None) else entropy[vectors.index.isin(w2.index)]

            # --------------------------------------------------------------------
            # Calculate & compute the column means of cvec
            # --------------------------------------------------------------------
            try:
                # Reshape w2.values.flatten() and entro to align with the dimensions of vectors
                w2_array    = np.nan_to_num(w2.values.flatten().reshape(-1, 1), nan=0)
                entro_array = np.nan_to_num(entro              .reshape(-1, 1), nan=0)
                vnorm_array = np.nan_to_num(np.array(vnorm)    .reshape(-1, 1), nan=0)

                # Calculate cvec
                calc = vectors.loc[w2.index].values * w2_array * entro_array / vnorm_array
                cvec = pd.DataFrame(calc, index=w2.index, columns=vectors.columns)
    
            except Exception as e: print(f"Error occurred: {e}"); continue

            # Equivalent to 'numeric' check in R
            if cvec.ndim == 1: win_vec[j, :] = cvec
            else:              win_vec[j, :] = cvec.mean(axis=0)


        # =======================================================================
        # 
        # =======================================================================
        win_vec = np.nan_to_num(win_vec, nan=0)
        