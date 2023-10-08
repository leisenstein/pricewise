"use client" // clientside render component instead of server side rendered
import { scrapeAndStoreProduct } from '@/lib/actions';
import { FormEvent, useState} from 'react';
const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState('');  
  const [isLoading, setIsLoading] = useState(false);

  const isValidAmazonProductURL = (url: string) => {
    try {
      const parsedURL = new URL(url);
      const hostname = parsedURL.hostname;

      // Check if hostname contains amazon.com or amazon.*.countrycode
      if( hostname.includes('amazon.com') || 
          hostname.includes('amazon.') || 
          hostname.endsWith('amazon')) {
        return true;
      }

    } catch (error) {
      return false;
    }
    return false;
  }


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValidLink = isValidAmazonProductURL(searchPrompt);

    if(!isValidLink)
      alert('Please provide a valid Amazon link.');

    try {
      setIsLoading(true);
      // scrape our first product page
      const product = await scrapeAndStoreProduct(searchPrompt);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form 
        className="flex flex-wrap gap-4 mt-12"
        onSubmit={handleSubmit}>
            <input 
                type="text"
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                placeholder="Enter product link"
                className="searchbar-input" />
                <button 
                    className="searchbar-brn"
                    type="submit"
                    disabled={searchPrompt ===''}
                >
                        {isLoading ? 'Searching...' : 'Search'}
                </button>
        </form>
  )
}

export default Searchbar