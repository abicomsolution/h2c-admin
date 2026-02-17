"use client";
import { useState, useEffect } from 'react'
import { CalendarDays } from "lucide-react";
import CancelBtn from '@/components/cancelBtn';
import PrimaryBtn from '@/components/primaryBtn';
import toast, { Toaster } from 'react-hot-toast';
import { TriangleAlert, ImagePlus, Trash2 } from "lucide-react";
import callApi from '@/utils/api-caller';
import _ from 'lodash';
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/context/PageTitleProvider";
import moment from 'moment';
import QuillEditor from '@/components/common/quilleditor';
import 'quill/dist/quill.snow.css';


const tmpForm = {
    _id: null,  
	transdate: moment().format("YYYY-MM-DD"),
	headline: null,
	content: null,
    ctype: 0,
    videourl: "",
}

export default function Form(props) {

    const { data } = props
    
    const router = useRouter();
    const { updatePageTitle } = usePageTitle();
        
    const [ formdata, setForm ] = useState(tmpForm);    
    const [savestate, setsavestate] = useState("")    
    const [errorMessage, setErrorMessage] = useState("")    
    const [photos, setPhotos] = useState([]);
    
    useEffect(() => {
   
        updatePageTitle("Create New News and Updates");
        
        if (data){     
            setForm({...data})
            setPhotos(data.photos || [])
            updatePageTitle("Edit News and Updates");
        }


    }, [data]);

    const handleChangeRegDate = (date)=>{       
        setForm({...formdata, transdate: moment(date).format("YYYY-MM-DD")})     
        setErrorMessage("")   
    }

    const handleChangeHeadline = (val) => {   
        setForm({...formdata, headline: val})
        setErrorMessage("")   
    }

    const handleChangeContent = (val) => {   
        setForm({...formdata, content: val})
        setErrorMessage("")   
    }

    const handleChangeType = (e) => {       
        setForm({...formdata, ctype: parseInt(e.target.value, 10)})  
        setErrorMessage("") 
    }

    
    const handleChange = (e)=>{
       
        setForm({...formdata, [e.target.name]: e.target.value})     
        setErrorMessage("")   
    }
   

    const handleSubmit = async(e)=>{    
        
        e.preventDefault();
      
        try {


            if (!formdata.transdate){
                setErrorMessage("Please select date.")
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                return;
            }

            if (!formdata.headline || formdata.headline==="<p></p>"){
                setErrorMessage("Please enter headline.")
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                return;
            }

            if (!formdata.content || formdata.content==="<p></p>"){
                setErrorMessage("Please enter content.")
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                return;
            }


            if (formdata.ctype==1 && photos.length==0){
                setErrorMessage("Please upload at least one photo for 'With Photos' content type.")
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                return;
            }
         
             
            if (formdata.ctype==2 && !formdata.videourl){
                setErrorMessage("Please enter video url for 'With Video' content type.")
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                return;
            }
            
            setsavestate("saving")
            setErrorMessage("")

            let payload = { ...formdata, photos: photos}

            let url = '/highlights/add'
            if (formdata._id){
                url = '/highlights/update'
            }
          
            const response = await callApi(url, 'POST', payload);
            if (response.status==200){                 
                setsavestate("saved")     
                if (formdata._id){    
                    toast.success('Changes successfully saved!')                    
                }else{
                    toast.success('New highlight successfully saved!')                                            
                }
              
                router.replace("/news-and-updates/"+response.data)
            }else{
                setsavestate("failed")
                setErrorMessage(response.message) 
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
            }

        } catch (error) {
            console.error('Error saving setup:', error);
            setErrorMessage("An error occurred while saving. Please try again.")
            setsavestate("")
             window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
            return;
        }               
    }    

     const addImages = async (images) => {
        let tempPhotos = []      
        for (var i = 0; i < images.length; i++) {
            let new_id = `${new Date().getTime()}-${i}`
            tempPhotos.push({ id: new_id, path: images[i], onInsert: true})
        }
        setPhotos([...photos, ...tempPhotos])        
    }

    const readFile = (img) => {
        return new Promise((res) => {
            const reader = new FileReader();
            reader.onload = function (o) {
                const image = new Image();
                image.src = reader.result;
                image.onload = function() {
                    if(image.width < 120 || image.height < 120){
                        // seterrorMessage("Photo is too small. Should be at least 120 x 120.")                         
                         toast('Photo is too small. Should be at least 120 x 120.',
                            {
                              icon: '❌',
                              style: {
                                borderRadius: '10px',
                                background: '#333',
                                color: '#fff',
                              },
                            }
                          );                        
                    } else {
                        res(o.target.result)
                    }
                };
            }
            reader.readAsDataURL(img);
        })
    }

    const handleUploadChange = async (e) => {
        setErrorMessage("")
        if (photos.length>=20){
            toast.error("You've reach maximum number of photos!.");          
            return
        }else{
          const images = []
          for (var i = 0; i < e.target.files.length; i++) {
              images.push(readFile(e.target.files[i]))
          }
          const newImages = await Promise.all(images)
          addImages(newImages)
        }     
    }

    const handleDelete = (id) => {
        let newPhotos = photos
        let p_index = _.findIndex(newPhotos, function (o) { return o.id == id})
        console.log("p_index", p_index)
        if(p_index>=0){
            // newPhotos.splice(p_index, 1)
            // setPhotos([...newPhotos])
            newPhotos[p_index] = {
                ...newPhotos[p_index],
                onDelete: true
            }
            setPhotos([...newPhotos])            
        }
    }

  
        
    var errorBox = null
    if (errorMessage) {
        errorBox =  <div className="pb-6">
                        <div className="flex gap-2 bg-[#e12d2dbf] p-2 rounded-sm">
                            <TriangleAlert  className="h-6 w-6  text-white" strokeWidth={3} />
                            <span className="text-base font-bold text-white">{errorMessage}</span>
                        </div>
                    </div>
                   
    }


    return (
      <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
              <div className="border-b border-slate-200/70 px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">News and updates</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">Content</h2>
                  <p className="mt-1 text-sm text-slate-500">Publish new highlights with text, photos, or video.</p>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6">
                  {errorBox}

                  <div className="space-y-6">
                      <div className="space-y-6">
                          <div>
                              <label className="text-sm font-semibold text-slate-700">Date</label>
                              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                                  <CalendarDays className="h-4 w-4 text-slate-400" />
                                  {moment(formdata.transdate).format("MM/DD/YYYY")}
                              </div>
                          </div>

                          <div>
                              <label className="text-sm font-semibold text-slate-700">Headline</label>
                              <div className="mt-2 rounded-xl border border-slate-200">
                                  <QuillEditor value={formdata.headline} onChange={handleChangeHeadline} />
                              </div>
                          </div>

                          <div>
                              <label className="text-sm font-semibold text-slate-700">Content</label>
                              <div className="mt-2 rounded-xl border border-slate-200">
                                  <QuillEditor value={formdata.content} onChange={handleChangeContent} />
                              </div>
                          </div>
                      </div>

                      <div className="space-y-6">
                          <div>
                              <label className="text-sm font-semibold text-slate-700">Media Content Type</label>
                              <div className="mt-3 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                      <input
                                          type="radio"
                                          name="ctype"
                                          value="0"
                                          checked={formdata.ctype == 0}
                                          onChange={handleChangeType}
                                          className="h-4 w-4 text-sky-600"
                                      />
                                      No media (plain text)
                                  </label>
                                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                      <input
                                          type="radio"
                                          name="ctype"
                                          value="1"
                                          checked={formdata.ctype == 1}
                                          onChange={handleChangeType}
                                          className="h-4 w-4 text-sky-600"
                                      />
                                      With Photos
                                  </label>
                                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                      <input
                                          type="radio"
                                          name="ctype"
                                          value="2"
                                          checked={formdata.ctype == 2}
                                          onChange={handleChangeType}
                                          className="h-4 w-4 text-sky-600"
                                      />
                                      With Video (single video link)
                                  </label>
                              </div>
                          </div>

                          {formdata.ctype == 1 && (
                              <div>
                                  <label className="text-sm font-semibold text-slate-700">Photos</label>
                                  <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                      {photos.map((item, index) => {
                                          if (item.onDelete) {
                                              return null
                                          }
                                          return (
                                              <div
                                                  key={index}
                                                  className="relative overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50"
                                              >
                                                  <button
                                                      type="button"
                                                      className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md hover:bg-slate-100"
                                                      onClick={() => handleDelete(item?.id)}
                                                  >
                                                      <Trash2 className="h-4 w-4 text-red-600" />
                                                  </button>
                                                  <img src={item.path} alt="Upload" className="h-32 w-full object-cover" />
                                              </div>
                                          )
                                      })}
                                      <div className="custom-file upload-box">
                                          <input
                                              type="file"
                                              id="uploadBtn"
                                              multiple
                                              accept="image/*"
                                              className="custom-file-input"
                                              onChange={handleUploadChange}
                                          />
                                          <label
                                              htmlFor="uploadBtn"
                                              className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400"
                                          >
                                              <ImagePlus className="h-6 w-6" />
                                          </label>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {formdata.ctype == 2 && (
                              <div>
                                  <label className="text-sm font-semibold text-slate-700">
                                      Video Url<span className="text-red-600">*</span>
                                  </label>
                                  <input
                                      type="text"
                                      defaultValue={formdata.videourl}
                                      value={formdata.videourl}
                                      name="videourl"
                                      onChange={handleChange}
                                      placeholder="https://"
                                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100"
                                  />
                              </div>
                          )}
                      </div>
                  </div>

                  <div className="mt-8 flex flex-wrap justify-end gap-4 border-t border-slate-200/70 pt-6">
                      <CancelBtn onClick={() => router.back()} isLoading={savestate === "saving"}>
                          Back
                      </CancelBtn>
                      <PrimaryBtn type="submit" isLoading={savestate === "saving"}>
                          Save
                      </PrimaryBtn>
                  </div>
              </form>
          </div>
          <Toaster position="top-center" reverseOrder={false} />
      </div>
    );
}
